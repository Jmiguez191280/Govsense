/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file', 'N/format', 'N/xml', 'N/url', 'N/runtime', './handlebars-v4.0.5.js'], function(https, record, email, search, file,
		format, xml, url, runtime, hb) {

	function getURL(nsURL) {

		try {
			if (nsURL) {

				log.debug('getURL', 'URL : ' + nsURL);

				var escURL = xml.escape({
					xmlText : nsURL
				});

				log.debug('getURL', 'URL (esc) : ' + escURL);

				var currDomain = url.resolveDomain({
					hostType : url.HostType.APPLICATION,
					accountId : runtime.accountId
				});

				escURL = 'https://' + currDomain + escURL;
				log.debug('getURL', 'Full URL : ' + escURL);

				return escURL;

			} else {
				return '';
			}

		} catch (e) {
			log.error('getURL : ERROR', e)
		}
	}
	function getAttachedFiles(id) {

		var arrRet = [];
		try {

			var rs = search.create({
				type : "salesorder",
				filters : [["internalid", "anyof", id], "AND", ["mainline", "is", "T"]],
				columns : [search.createColumn({
					name : "internalid",
					join : "file"
				}), search.createColumn({
					name : "name",
					join : "file"
				}), search.createColumn({
					name : "url",
					join : "file"
				}), search.createColumn({
					name : "filetype",
					join : "file"
				}), search.createColumn({
					name : "availablewithoutlogin",
					join : "file"
				}), search.createColumn({
					name : "created",
					join : "file",
					label : "Date Created"
				})]
			});
			rs.run().each(function(result) {

				var fileID = result.getValue({
					name : 'internalid',
					join : 'file'
				});

				var fileURL = result.getValue({
					name : 'url',
					join : 'file'
				});

				var fileType = result.getValue({
					name : 'filetype',
					join : 'file'
				});

				var isAvailable = result.getValue({
					name : 'availablewithoutlogin',
					join : 'file'
				});

				log.debug('getAttachedFiles', 'File type : ' + fileType + ' | id : ' + fileID + ' | Available ? ' + isAvailable);

				if (fileURL && (fileType == 'JPGIMAGE' || fileType == 'PNGIMAGE')) {

					try {
						if (!isAvailable) {

							var fileObj = file.load({
								id : fileID
							});

							fileObj.isOnline = true;
							fileObj.save();
						}

						arrRet.push({
							date : result.getValue({
								name : "created",
								join : "file",
								label : "Date Created"
							}),
							name : result.getValue({
								name : "name",
								join : "file"
							}),
							url : fileURL
						// getURL(fileURL)
						})

					} catch (e) {
						log.error('getAttachedFiles', 'Image File save ERROR : ' + e.message);
					}
				}

				if (fileURL && fileType == 'PDF') {

					try {

						if (!isAvailable) {

							var fileObj = file.load({
								id : fileID
							});

							fileObj.isOnline = true;
							fileObj.save();
						}

						arrRet.push({
							date : result.getValue({
								name : "created",
								join : "file",
								label : "Date Created"
							}),
							name : result.getValue({
								name : "name",
								join : "file"
							}),
							url : fileURL
						})

					} catch (e) {
						log.error('getAttachedFiles', 'PDF File save ERROR : ' + e.message);
					}
				}

				return true;
			});

		} catch (e) {
			log.error('getAttachedFiles', 'ERROR : ' + e.message);
		}

		return arrRet;
	}

	function getInspections(soId) {
		var arrRet = [];
		try {
			var srch = search.create({
				type : "task",
				filters : [["transaction.internalid", "anyof", soId], "AND", ["transaction.mainline", "is", "T"]],
				columns : [search.createColumn({
					name : "title",
					label : "Inspection Title"
				}), search.createColumn({
					name : "assigned",
					label : "Assigned To"
				}), search.createColumn({
					name : "startdate",
					label : "Start Date"
				}), search.createColumn({
					name : "duedate",
					sort : search.Sort.ASC,
					label : "Due Date"
				}), search.createColumn({
					name : "message",
					label : "Comment"
				})]
			});
			var searchResultCount = srch.runPaged().count;

			srch.run().each(function(result) {

				arrRet.push({
					date : result.getValue('startdate'),
					officer : result.getText('assigned'),
					notes : result.getValue('message')
				});
				return true;
			});

		} catch (e) {
			log.error('getInspections', 'ERROR : ' + e);
		}

		log.debug('getInspections', 'result : ' + JSON.stringify(arrRet));
		return arrRet;
	}

	function showDetails(context, obj) {

		// log.audit('getFunction', 'Context object : ' +
		// JSON.stringify(context));

		var params = context.request.parameters;
		log.audit('showResultPage', 'Context parameters : ' + JSON.stringify(params));

		var recLic = record.load({
			type : 'salesorder',
			id : params.id
		});

		var appDate = recLic.getValue('trandate');
		var endDate = recLic.getValue('enddate');
		var establishedDate = recLic.getValue('custbody_gs_license_establisheddate');
		if (appDate) {

			appDate = format.format({
				value : appDate,
				type : format.Type.DATE
			});
		}
		if (endDate) {

			endDate = format.format({
				value : endDate,
				type : format.Type.DATE
			});
		}
		if (establishedDate) {

			establishedDate = format.format({
				value : establishedDate,
				type : format.Type.DATE
			});
		}

		var arrVisits = getInspections(params.id);
		var objData = {
			businessname : recLic.getText('entity'),
			licenseaddress : recLic.getText('custbody_gs_lic_spatiallocation'),
			licensetype : recLic.getText('custbody_gs_license_type'),
			licensesubtype : recLic.getText('custbody_gs_coo_licensesubtype'),
			establisheddate : establishedDate,
			applicationdate : appDate,
			expirationdate : endDate,
			statelicnumber : recLic.getValue('custbody_gs_coo_state_license_number'),
			licensestatus : recLic.getText('custbody_gs_coo_liensestatus'),
			sitevisits : arrVisits,
			attachments : getAttachedFiles(params.id),
			lastsitevisit : (arrVisits.length > 0) ? arrVisits[0].date : '',
			maplinkadrs : parseAddress(recLic)
		};

		log.audit('showDetails', 'Data out  : ' + JSON.stringify(objData));
		var template = hb.compile(obj.getValue('custrecord_oscc_landingpage_template'));

		context.response.write(template(objData));

	}

	function setIframe(address) {

		var mapUrl = 'https://maps.google.com/maps?q=' + address + '&t=&z=17&ie=UTF8&iwloc=&output=embed';
		log.debug('setIframe', 'Map Url : ' + mapUrl);

		return mapUrl;
	}

	function parseAddress(recObj) {

		var iFrameSpacer = '%20';
		var defaultAddress = 'OCALA' + iFrameSpacer + 'FL' + iFrameSpacer + 'US';
		var formattedAddress = '';

		// Get Primary Location
		var primaryLocation = recObj.getText({
			fieldId : 'custbody_gs_lic_spatiallocation'
		});

		var parseAddress = primaryLocation.split('|');
		if (!parseAddress[0]) {
			log.debug('parseAddress', 'Address Missing...using default');

			return setIframe(defaultAddress);
		} else {

			var newAddress = parseAddress[0];
			log.debug('parseAddress', 'newAddress: ' + newAddress);
		}

		var parseSpaces = newAddress.split(' ');

		if (!parseSpaces[0]) {
			log.debug('parseAddress', 'Space 1 Missing');

			return setIframe(defaultAddress);
		} else {
			var spaceOne = parseSpaces[0];
			log.debug('parseAddress', 'space1:' + spaceOne);
			if (spaceOne == 0) {

				return setIframe(defaultAddress);
			}
			formattedAddress = spaceOne;
			log.debug('parseAddress', 'formattedAddress: ' + formattedAddress);
		}

		if (!parseSpaces[1]) {
			log.debug('parseAddress', 'Space 2 Missing');

			return setIframe(defaultAddress);

		} else {
			var spaceTwo = parseSpaces[1];
			log.debug('parseAddress', 'space2: ' + spaceTwo);
			formattedAddress += iFrameSpacer + spaceTwo;
			log.debug('parseAddress', 'formattedAddress:' + formattedAddress);
		}

		if (!parseSpaces[2]) {
			log.debug('parseAddress', 'Space 3 Missing');
			formattedAddress += iFrameSpacer + defaultAddress;

			return setIframe(formattedAddress);
		} else {
			var spaceThree = parseSpaces[2];
			log.debug('parseAddress', 'space3:' + spaceThree);
			formattedAddress += iFrameSpacer + spaceThree;
			log.debug('parseAddress', 'formattedAddress:' + formattedAddress);
		}

		if (!parseSpaces[3]) {
			log.debug('parseAddress', 'Space 4 Missing');
			formattedAddress += iFrameSpacer + defaultAddress;

			return setIframe(formattedAddress);
		} else {
			var spaceFour = parseSpaces[3];
			log.debug('parseAddress', 'space4: ' + spaceFour);
			formattedAddress += iFrameSpacer + spaceFour;
			log.debug('parseAddress', 'formattedAddress: ' + formattedAddress);
		}

		if (!parseSpaces[4]) {
			log.debug('parseAddress', 'Space 5 Missing');
			formattedAddress += iFrameSpacer + defaultAddress;
			return setIframe(formattedAddress);
		} else {
			var spaceFive = parseSpaces[4];
			log.debug('parseAddress', 'space5: ', spaceFive);
			formattedAddress += iFrameSpacer + spaceFive + iFrameSpacer + defaultAddress;
			log.debug('parseAddress', 'formattedAddress:' + formattedAddress);
			return setIframe(formattedAddress);
		}

		return setIframe(defaultAddress);
	}

	function onRequestFxn(context) {

		try {

			var objSRC = record.load({
				type : 'customrecord_online_support_case_config',
				id : 2
			});

			var params = context.request.parameters;
			log.audit('onRequestFxn | POST', 'Context parameters : ' + JSON.stringify(params));

			showDetails(context, objSRC);

		} catch (e) {
			log.error('onRequestFxn', 'ERROR : ' + e);
		}
	}
	return {
		onRequest : onRequestFxn
	};
});