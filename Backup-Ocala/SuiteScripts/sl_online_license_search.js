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

    function getLicenseStatus() {
        var arrRetVal = [];
        try {

            var rs = search.create({
                type: 'customlistgs_coo_lisencestatuslist',
                columns: [search.createColumn({
                    name: "internalid",
                }), search.createColumn({
                    name: "name"
                })]
            });

            var searchResultCount = rs.runPaged().count;
            log.debug('getListValues', 'result count : ' + searchResultCount);

            rs.run().each(function(result) {

                arrRetVal.push({
                    id: result.id,
                    name: result.getValue('name')
                });
                return true;
            });

        } catch (e) {
            log.error('getLicenseStatus', 'ERROR : ' + e);
        }

        return arrRetVal;
    }

    function lookUpLicenses(params) {
        var arrRet = [];
        try {

            var srchLicense = search.create({
                type: "salesorder",
                filters: [
                    ["mainline", "is", "T"]
                ],
                columns: [search.createColumn({
                    name: "tranid",
                    sort: search.Sort.ASC
                }), search.createColumn({
                    name: "custrecord_gs_spatiallocation_full_addr",
                    join: "custbody_gs_lic_spatiallocation",
                    label: "Address"
                }), search.createColumn({
                    name: "custbody_gs_coo_liensestatus",
                    sort: search.Sort.ASC,
                    label: "License Staus"
                })]
            });

            if (params.licensenumber) {

                srchLicense.filters.push(search.createFilter({
                    name: "formulanumeric",
                    operator: "equalto",
                    formula: "case when TO_CHAR({tranid}) LIKE '%" + String(params.licensenumber) + "%' then 1 else 0 end",
                    values: 1,
                }));
            }

            if (params.businessname) {

                srchLicense.filters.push(search.createFilter({
                    name: "formulanumeric",
                    operator: "equalto",
                    formula: "case when TO_CHAR({entity}) LIKE '%" + String(params.businessname) + "%' then 1 else 0 end",
                    values: 1,
                }));
            }

            if (params.addrs) {

                srchLicense.filters.push(search.createFilter({
                    name: "formulanumeric",
                    operator: "equalto",
                    formula: "case when {custbody_gs_lic_spatiallocation.custrecord_gs_spatiallocation_full_addr} LIKE '%" + String(params.addrs) + "%' then 1 else 0 end",
                    values: 1,
                }));
            }

            if (params.licensestatus) {

                srchLicense.filters.push(search.createFilter({
                    name: 'custbody_gs_coo_liensestatus',
                    operator: 'anyof',
                    values: [params.licensestatus]
                }));
            }

            if (params.licensedatefrom && params.licensedateto) {

                log.audit('lookUpLicenses', 'date |  from : ' + params.licensedatefrom + ' | to : ' + params.licensedateto);

                srchLicense.filters.push(search.createFilter({
                    name: 'trandate',
                    operator: 'within',
                    values: [params.licensedatefrom, params.licensedateto]
                }));

            } else if (params.licensedatefrom) {

                srchLicense.filters.push(search.createFilter({
                    name: 'trandate',
                    operator: 'onorafter',
                    values: [params.licensedatefrom]
                }));
            }

            var searchResultCount = srchLicense.runPaged().count;
            log.debug('lookUpLicenses', 'result count : ' + searchResultCount);

            var srchResults = getAllResults(srchLicense);

            srchResults.forEach(function(result) {

                arrRet.push({
                    licenseid: result.id,
                    licensenum: result.getValue('tranid'),
                    licenseaddress: result.getValue({
                        name: 'custrecord_gs_spatiallocation_full_addr',
                        join: 'custbody_gs_lic_spatiallocation'
                    }),
                    licensestatus: result.getText('custbody_gs_coo_liensestatus')
                });
                return true;

            });

        } catch (e) {
            log.error('lookUpLicenses', 'ERROR : ' + e);
        }

        return arrRet;
    }

    function showSearchPage(context, obj) {

        // log.audit('getFunction', 'Context object : ' +
        // JSON.stringify(context));

        var params = context.request.parameters;
        log.audit('showSearchPage', 'Context parameters : ' + JSON.stringify(params));

        var arrLicenseStatuses = getLicenseStatus();

        var objData = {
            licensestatus: arrLicenseStatuses,
            hasresults: 'Yes'
        };

        if (context.request.method === 'GET' || context.request.parameters.entry == 'T') {
            objData.hasresults = '';
            objData.licenses = [];

        } else {

            objData.licenses = lookUpLicenses(params);
        }

        var template = hb.compile(obj.getValue('custrecord_oscc_searchpage_template'));

        context.response.write(template(objData));

    }

    function onRequestFxn(context) {

        try {

            var objSRC = record.load({
                type: 'customrecord_online_support_case_config',
                id: 2
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