/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file', './handlebars-v4.0.5.js'], function(https, record, email, search, file, hb) {

	function getAllResults(s) {
		var results = s.run();
		var searchResults = [];
		var searchid = 0;
		do {
			var resultslice = results.getRange({
				start : searchid,
				end : searchid + 1000
			});
			resultslice.forEach(function(slice) {
				searchResults.push(slice);
				searchid++;
			});
		} while (resultslice.length >= 1000);
		return searchResults;
	}

	function getCaseTypes() {
		var arrRet = [];
		try {

			var srch = search.create({
				type : "customrecord_gs_ce_detailedcasetype",
				filters : [["isinactive", "is", "F"]],
				columns : [search.createColumn({
					name : "name",
					sort : search.Sort.ASC,
					label : "Name"
				})]
			});

			var searchResultCount = srch.runPaged().count;
			log.debug('getCaseTypes', 'result count : ' + searchResultCount);

			srch.run().each(function(result) {

				arrRet.push({
					id : result.id,
					name : result.getValue('name')
				});
				return true;
			});
		} catch (e) {
			log.error('getCaseTypes', 'ERROR : ' + e);
		}

		return arrRet;
	}

	function lookUpCases(params) {
		var arrRet = [];
		try {

			var srchCase = search.create({
				type : "supportcase",
				columns : [search.createColumn({
					name : "casenumber",
					sort : search.Sort.ASC,
					label : "Number"
				}), search.createColumn({
					name : "custrecord_gs_spatiallocation_full_addr",
					join : "CUSTEVENT_GS_CE_PRIMARYLOCATION",
					label : "Address"
				}), search.createColumn({
					name : "custevent_gs_code_detailedcasetype",
					sort : search.Sort.ASC,
					label : "Case Type"
				}), search.createColumn({
					name : "status",
					sort : search.Sort.ASC,
					label : "Case Staus"
				})]
			});

			if (params.casenumber) {

				srchCase.filters.push(search.createFilter({
					name : "formulanumeric",
					operator : "equalto",
					formula : "case when TO_CHAR({casenumber}) LIKE '%" + String(params.casenumber) + "%' then 1 else 0 end",
					values : 1,
				}));
			}

			if (params.addrs) {

				srchCase.filters.push(search.createFilter({
					name : "formulanumeric",
					operator : "equalto",
					formula : "case when {custevent_gs_ce_primarylocation.custrecord_gs_spatiallocation_full_addr} LIKE '%" + String(params.addrs) + "%' then 1 else 0 end",
					values : 1,
				}));
			}

			if (params.casetype) {

				srchCase.filters.push(search.createFilter({
					name : 'custevent_gs_code_detailedcasetype',
					operator : 'anyof',
					values : [params.casetype]
				}));
			}

			if (params.casestatus) {

				srchCase.filters.push(search.createFilter({
					name : 'status',
					operator : 'anyof',
					values : [params.casestatus]
				}));
			}
			
			if (params.casedate) {

				srchCase.filters.push(search.createFilter({
					name : 'date',
					operator : 'on',
					values : [params.casedate]
				}));
			}
			

			var searchResultCount = srchCase.runPaged().count;
			log.debug('lookUpCases', 'result count : ' + searchResultCount);

			var srchResults = getAllResults(srchCase);

			srchResults.forEach(function(result) {

				arrRet.push({
					caseid : result.id,
					casenum : result.getValue('casenumber'),
					caseaddress : result.getValue({
						name : 'custrecord_gs_spatiallocation_full_addr',
						join : 'CUSTEVENT_GS_CE_PRIMARYLOCATION'
					}),
					casetype : result.getText('custevent_gs_code_detailedcasetype'),
					casestatus : result.getText('status')
				});
				return true;

			});

		} catch (e) {
			log.error('lookUpCases', 'ERROR : ' + e);
		}

		return arrRet;
	}

	function showSearchPage(context, obj) {

		// log.audit('getFunction', 'Context object : ' +
		// JSON.stringify(context));

		var params = context.request.parameters;
		log.audit('showSearchPage', 'Context parameters : ' + JSON.stringify(params));

		var caseStatuses = obj.getValue('custrecord_oscc_case_status_list');
		var arrCaseStatusNames = String(obj.getText('custrecord_oscc_case_status_list')).split(',');

		// log.audit('getFunction', 'Case status list : ' + caseStatuses);
		// log.audit('getFunction', 'Case status list (name) : ' +
		// arrCaseStatusNames);

		var arrStatusList = [];
		for (x in caseStatuses) {

			// log.audit('x : ' + x);
			// log.audit('caseStatuses[x] : ' + ' id : ' + caseStatuses[x] + '
			// name : ' + arrCaseStatusNames[x]);

			arrStatusList.push({
				id : caseStatuses[x],
				name : arrCaseStatusNames[x]
			});
		}

		var objData = {
			casetypes : getCaseTypes(),
			casestatus : arrStatusList,
			hasresults : 'Yes'
		};

		if (context.request.method === 'GET' || context.request.parameters.entry == 'T') {
			objData.hasresults = '';
			objData.cases = [];
			
		} else {
			
			objData.cases = lookUpCases(params);
		}

		var template = hb.compile(obj.getValue('custrecord_oscc_searchpage_template'));

		context.response.write(template(objData));

	}

	function onRequestFxn(context) {

		try {

			var objSRC = record.load({
				type : 'customrecord_online_support_case_config',
				id : 1
			});

			var params = context.request.parameters;
			log.audit('onRequestFxn', 'Context parameters : ' + JSON.stringify(params));

			showSearchPage(context, objSRC);

		} catch (e) {
			log.error('onRequestFxn', 'ERROR : ' + e);
		}
	}
	return {
		onRequest : onRequestFxn
	};
});