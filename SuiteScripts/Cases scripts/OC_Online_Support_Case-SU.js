/**
 * SDB
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file'], function(https, record, email, search, file) {

    function getAllResults(s) {
        var results = s.run();
        var searchResults = [];
        var searchid = 0;
        do {
            var resultslice = results.getRange({
                start: searchid,
                end: searchid + 1000
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
                type: "customrecord_gs_ce_detailedcasetype",
                filters: [
                    ["isinactive", "is", "F"]
                ],
                columns: [search.createColumn({
                    name: "name",
                    sort: search.Sort.ASC,
                    label: "Name"
                })]
            });

            var searchResultCount = srch.runPaged().count;
            log.debug('getCaseTypes', 'result count : ' + searchResultCount);

            srch.run().each(function(result) {

                arrRet.push({
                    id: result.id,
                    name: result.getValue('name')
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

        log.audit('lookUpCases:', 'Context parameters : ' + JSON.stringify(params));
        try {

            var srchCase = search.create({
                type: "supportcase",
                columns: [search.createColumn({
                    name: "casenumber",
                    sort: search.Sort.ASC,
                    label: "Number"
                }), search.createColumn({
                    name: "custrecord_gs_spatiallocation_full_addr",
                    join: "CUSTEVENT_GS_CE_PRIMARYLOCATION",
                    label: "Address"
                }), search.createColumn({
                    name: "custevent_gs_code_detailedcasetype",
                    sort: search.Sort.ASC,
                    label: "Case Type"
                }), search.createColumn({
                    name: "status",
                    sort: search.Sort.ASC,
                    label: "Case Staus"
                })]
            });


            if (params.casenumber) {

                srchCase.filters.push(search.createFilter({
                    name: "formulanumeric",
                    operator: "equalto",
                    formula: "case when TO_CHAR({casenumber}) LIKE '%" + String(params.casenumber) + "%' then 1 else 0 end",
                    values: 1,
                }));
            }

            if (params.addrs) {
                params.addrs = params.addrs.toUpperCase();
                log.audit('params.addrs:', 'Context parameters : ' + params.addrs);

                srchCase.filters.push(search.createFilter({
                    name: "formulanumeric",
                    operator: "equalto",
                    formula: "case when {custevent_gs_ce_primarylocation.custrecord_gs_spatiallocation_full_addr} LIKE '%" + String(params.addrs) + "%' then 1 else 0 end",
                    values: 1,
                }));
            }

            if (params.casetype) {

                srchCase.filters.push(search.createFilter({
                    name: 'custevent_gs_code_detailedcasetype',
                    operator: 'anyof',
                    values: [params.casetype]
                }));
            }

            if (params.casestatus) {

                srchCase.filters.push(search.createFilter({
                    name: 'status',
                    operator: 'anyof',
                    values: [params.casestatus]
                }));
            }

            if (params.casedate) {
                var date = params.casedate.substring(0, 10);
                log.audit('date:', 'Context parameters : ' + date);
                srchCase.filters.push(search.createFilter({
                    name: 'date',
                    operator: 'on',
                    values: [date]
                }));
            }

            if (params.casedatefrom) {
                var casedatefrom = params.casedatefrom.substring(0, 10);
                log.audit('casedatefrom:', 'Context parameters : ' + casedatefrom);
                srchCase.filters.push(search.createFilter({
                    name: 'startdate',
                    operator: 'onorafter',
                    values: [casedatefrom]
                }));

            }
            if (params.casedateto) {
                var casedateto = params.casedateto.substring(0, 10);
                log.audit('casedateto:', 'Context parameters : ' + casedateto);
                srchCase.filters.push(search.createFilter({
                    name: 'startdate',
                    operator: 'onorbefore',
                    values: [casedateto]
                }));
            }
            if (params.hearingdatefrom) {
                var hearingdatefrom = params.hearingdatefrom.substring(0, 10);
                log.audit('hearingdatefrom:', 'Context parameters : ' + hearingdatefrom);
                srchCase.filters.push(search.createFilter({
                    name: 'custevent_gs_coo_case_dateofhearing',
                    operator: 'onorafter',
                    values: [hearingdatefrom]
                }));

            }
            if (params.hearingdateto) {
                var hearingdateto = params.hearingdateto.substring(0, 10);
                log.audit('hearingdateto:', 'Context parameters : ' + hearingdateto);
                srchCase.filters.push(search.createFilter({
                    name: 'custevent_gs_coo_case_dateofhearing',
                    operator: 'onorbefore',
                    values: [hearingdateto]
                }));
            }


            var searchResultCount = srchCase.runPaged().count;
            log.debug('lookUpCases', 'result count : ' + searchResultCount);

            var srchResults = getAllResults(srchCase);

            srchResults.forEach(function(result) {

                arrRet.push({
                    caseid: result.id,
                    casenum: result.getValue('casenumber'),
                    caseaddress: result.getValue({
                        name: 'custrecord_gs_spatiallocation_full_addr',
                        join: 'CUSTEVENT_GS_CE_PRIMARYLOCATION'
                    }),
                    casetype: result.getText('custevent_gs_code_detailedcasetype'),
                    casestatus: result.getText('status')
                });
                return true;

            });

        } catch (e) {
            log.error('lookUpCases', 'ERROR : ' + e);
        }

        return arrRet;
    }

    function showSearchPage(context, obj) {


        var params = context.request.parameters;

        log.audit('showSearchPage', 'Context parameters : ' + JSON.stringify(params));
        params = JSON.parse(params.parameters);
        log.audit('showSearchPage---', 'Context parameters : ' + params);
        var caseStatuses = obj.getValue('custrecord_oscc_case_status_list');
        var arrCaseStatusNames = String(obj.getText('custrecord_oscc_case_status_list')).split(',');


        var arrStatusList = [];
        for (x in caseStatuses) {

            arrStatusList.push({
                id: caseStatuses[x],
                name: arrCaseStatusNames[x]
            });
        }

        var objData = {
            casetypes: getCaseTypes(),
            casestatus: arrStatusList,
            hasresults: 'Yes'
        };
        log.audit('context.request.method:', 'Context parameters : ' + context.request.method);


        if (params) {
            objData.cases = lookUpCases(params);

        } else {
            objData.hasresults = '';
            objData.cases = [];
        }

        // log.audit('objData: ', JSON.stringify(objData));
        context.response.write(JSON.stringify(objData));

    }

    function onRequestFxn(context) {

        try {

            var objSRC = record.load({
                type: 'customrecord_online_support_case_config',
                id: 1
            });

            var params = context.request.parameters;
            log.audit('onRequestFxn', 'Context parameters : ' + JSON.stringify(params));

            showSearchPage(context, objSRC);

        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
        }
    }
    return {
        onRequest: onRequestFxn
    };
});