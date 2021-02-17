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
                    xmlText: nsURL
                });

                log.debug('getURL', 'URL (esc) : ' + escURL);

                var currDomain = url.resolveDomain({
                    hostType: url.HostType.APPLICATION,
                    accountId: runtime.accountId
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
                type: "supportcase",
                filters: [
                    ["internalid", "anyof", id]
                ],
                columns: [search.createColumn({
                    name: "casenumber",
                    sort: search.Sort.ASC
                }), search.createColumn({
                    name: "internalid",
                    join: "file"
                }), search.createColumn({
                    name: "name",
                    join: "file"
                }), search.createColumn({
                    name: "url",
                    join: "file"
                }), search.createColumn({
                    name: "filetype",
                    join: "file"
                }), search.createColumn({
                    name: "availablewithoutlogin",
                    join: "file"
                }), search.createColumn({
                    name: "created",
                    join: "file",
                    label: "Date Created"
                })]
            });
            rs.run().each(function(result) {

                var fileID = result.getValue({
                    name: 'internalid',
                    join: 'file'
                });

                var fileURL = result.getValue({
                    name: 'url',
                    join: 'file'
                });

                var fileType = result.getValue({
                    name: 'filetype',
                    join: 'file'
                });

                var isAvailable = result.getValue({
                    name: 'availablewithoutlogin',
                    join: 'file'
                });

                log.debug('getAttachedFiles', 'File type : ' + fileType + ' | id : ' + fileID + ' | Available ? ' + isAvailable);

                if (fileURL && (fileType == 'JPGIMAGE' || fileType == 'PNGIMAGE')) {

                    try {
                        if (!isAvailable) {

                            var fileObj = file.load({
                                id: fileID
                            });

                            fileObj.isOnline = true;
                            fileObj.save();
                        }

                        arrRet.push({
                            date: result.getValue({
                                name: "created",
                                join: "file",
                                label: "Date Created"
                            }),
                            name: result.getValue({
                                name: "name",
                                join: "file"
                            }),
                            url: fileURL
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
                                id: fileID
                            });

                            fileObj.isOnline = true;
                            fileObj.save();
                        }

                        arrRet.push({
                            date: result.getValue({
                                name: "created",
                                join: "file",
                                label: "Date Created"
                            }),
                            name: result.getValue({
                                name: "name",
                                join: "file"
                            }),
                            url: fileURL
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

    function getInspections(caseId) {
        var arrRet = [];
        try {
            var srch = search.create({
                type: "task",
                filters: [
                    ["case.internalid", "anyof", caseId]
                ],
                columns: [search.createColumn({
                    name: "title",
                    label: "Inspection Title"
                }), search.createColumn({
                    name: "assigned",
                    label: "Assigned To"
                }), search.createColumn({
                    name: "startdate",
                    label: "Start Date"
                }), search.createColumn({
                    name: "duedate",
                    sort: search.Sort.ASC,
                    label: "Due Date"
                }), search.createColumn({
                    name: "message",
                    label: "Comment"
                })]
            });
            var searchResultCount = srch.runPaged().count;
            log.debug('getInspections', 'result count : ' + searchResultCount);

            srch.run().each(function(result) {

                arrRet.push({
                    date: result.getValue('startdate'),
                    officer: result.getText('assigned'),
                    notes: result.getValue('message')
                });
                return true;
            });

        } catch (e) {
            log.error('getInspections', 'ERROR : ' + e);
        }

        return arrRet;
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
        try {

            var srch = search.create({
                type: "supportcase",
                columns: [search.createColumn({
                    name: "casenumber",
                    sort: search.Sort.ASC,
                    label: "Number"
                }), search.createColumn({
                    name: "casenumber",
                    sort: search.Sort.ASC,
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

                srch.filters.push(search.createFilter({
                    name: "formulanumeric",
                    operator: "equalto",
                    formula: "case when TO_CHAR({casenumber}) LIKE '%" + String(params.casenumber) + "%' then 1 else 0 end",
                    values: 1,
                }));
            }

            if (params.casetype) {

                rs.filters.push(search.createFilter({
                    name: 'custevent_gs_code_detailedcasetype',
                    operator: 'anyof',
                    values: [objIn.casetype]
                }));
            }

            if (params.casestatus) {

                rs.filters.push(search.createFilter({
                    name: 'status',
                    operator: 'anyof',
                    values: [objIn.casestatus]
                }));
            }

            var searchResultCount = srch.runPaged().count;
            log.debug('lookUpCases', 'result count : ' + searchResultCount);

            srch.run().each(function(result) {

                arrRet.push({
                    caseid: result.id,
                    casenum: result.getValue('casenumber'),
                    caseaddress: '',
                    casetype: result.getValue('custevent_gs_code_detailedcasetype'),
                    casestatus: result.getValue('status')
                });
                return true;
            });
        } catch (e) {
            log.error('lookUpCases', 'ERROR : ' + e);
        }

        return arrRet;
    }

    function showDetails(context, obj) {

        // log.audit('getFunction', 'Context object : ' +
        // JSON.stringify(context));

        var params = context.request.parameters;
        log.audit('showResultPage', 'Context parameters : ' + JSON.stringify(params));

        var recCase = record.load({
            type: 'supportcase',
            id: params.id
        });

        var violationsCtr = recCase.getLineCount('recmachcustrecord_gs_violation_case');
        var arrViolations = [];
        for (var i = 0; i < violationsCtr; i++) {

            arrViolations.push({
                ctr: (i + 1),
                type: recCase.getSublistText('recmachcustrecord_gs_violation_case', 'custrecord_gs_violation_type', i),
                req_date: recCase.getSublistText('recmachcustrecord_gs_violation_case', 'custrecord_gs_violation_dateobserved', i)
            });
        }

        var caseLocation = recCase.getValue('custevent_gs_ce_primarylocation');
        var caseAddrs = '';
        var addrsMapVal = '';

        if (caseLocation) {
            var recSL = record.load({
                type: 'customrecord_gs_gbl_spatiallocation',
                id: caseLocation
            });

            caseAddrs = recSL.getValue('custrecord_gs_spatiallocation_full_addr');
            caseAdrsCity = recSL.getValue('custrecord_gs_spatiallocation_city');
            caseAdrsZip = recSL.getValue('custrecord_gs_spatiallocation_postal');

            addrsMapVal = caseAddrs.replace(/ /g, "+") + '+' + caseAdrsCity + '+' + caseAdrsZip;
        }

        var caseStartDate = recCase.getValue('startdate');
        var caseNextHearing = recCase.getValue('custevent_gs_coo_case_dateofhearing');

        if (caseStartDate) {

            caseStartDate = format.format({
                value: caseStartDate,
                type: format.Type.DATE
            });
        }

        if (caseNextHearing) {

            caseNextHearing = format.format({
                value: caseNextHearing,
                type: format.Type.DATE
            });
        }

        var arrVisits = getInspections(params.id);
        var objData = {
            casenumber: recCase.getValue('casenumber'),
            caseaddress: caseAddrs,
            casetype: recCase.getText('custevent_gs_code_detailedcasetype'),
            casesubtype: recCase.getValue('title'),
            caseopen: caseStartDate,
            casestatus: recCase.getText('status'),
            caseofficer: recCase.getText('assigned'),
            nexthearing: caseNextHearing,
            violations: arrViolations,
            sitevisits: arrVisits,
            attachments: getAttachedFiles(params.id),
            lastsitevisit: (arrVisits.length > 0) ? arrVisits[0].date : '',
            maplinkadrs: parseAddress(recCase)
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

    function parseAddress(caseObj) {

        var iFrameSpacer = '%20';
        var defaultAddress = 'OCALA' + iFrameSpacer + 'FL' + iFrameSpacer + 'US';
        var formattedAddress = '';

        // Get Primary Location
        var primaryLocation = caseObj.getText({
            fieldId: 'custevent_gs_ce_primarylocation'
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
                type: 'customrecord_online_support_case_config',
                id: 1
            });

            var params = context.request.parameters;
            log.audit('onRequestFxn | POST', 'Context parameters : ' + JSON.stringify(params));

            showDetails(context, objSRC);

        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
        }
    }
    return {
        onRequest: onRequestFxn
    };
});