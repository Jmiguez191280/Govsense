/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file'], function(https, record, email, search, file) {

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
        log.debug('getCaseTypes', 'arrRet : ' + JSON.stringify(arrRet));

        return arrRet;
    }

    function returnStatusCase() {
        var obj = record.load({
            type: 'customrecord_online_support_case_config',
            id: 1
        });
        var caseStatuses = obj.getValue('custrecord_oscc_case_status_list');
        var arrCaseStatusNames = String(obj.getText('custrecord_oscc_case_status_list')).split(',');

        log.audit('getFunction', 'Case status list : ' + caseStatuses);
        log.audit('getFunction', 'Case status list (name) : ' +
            arrCaseStatusNames);

        var arrStatusList = [];
        for (x in caseStatuses) {

            log.audit('x : ' + x);
            log.audit('caseStatuses[x] : ' + ' id : ' + caseStatuses[x] + 'name : ' + arrCaseStatusNames[x]);

            arrStatusList.push({
                id: caseStatuses[x],
                name: arrCaseStatusNames[x]
            });

        }
        log.audit('returnStatusCase', 'arrStatusList : ' + JSON.stringify(arrStatusList));
        return arrStatusList;
    }

    function onRequestFxn(context) {

        try {
            var objData = {}
            var statusList = returnStatusCase();
            var caseTypes = getCaseTypes();

            if (caseTypes) objData.caseTypes = caseTypes;
            if (statusList) objData.statusList = statusList;

        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
        }
        context.response.write(JSON.stringify(objData));
    }
    return {
        onRequest: onRequestFxn
    };

});