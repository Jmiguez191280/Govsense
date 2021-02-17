/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/record'], function(record) {

    function onRequestFxn(context) {

        try {
            var json = context.request.parameters.jsonData;
            log.audit('onRequestFxn', json);
            json = JSON.parse(unescape(json))
            if (json) {

                var customRecord = record.create({
                    type: 'customrecord_gs_renewaldata',
                    isDynamic: true
                });

                if (json.renewalId) {
                    customRecord.setValue({
                        fieldId: 'custrecord_gs_renewaldata_renewalid',
                        value: json.renewalId
                    });
                }

                if (json.ipAddress) {
                    customRecord.setValue({
                        fieldId: 'custrecord_gs_renewaldata_ipaddress',
                        value: json.ipAddress
                    });
                }

                if (json.busName) {
                    customRecord.setValue({
                        fieldId: 'custrecord_gs_renewaldata_businessname',
                        value: json.busName
                    });
                }
                if (json.busLicense) {
                    customRecord.setValue({
                        fieldId: 'custrecord_gs_renewaldata_license',
                        value: json.busLicense
                    });
                }
                if (json.option) {
                    customRecord.setValue({
                        fieldId: 'custrecord_gs_renewaldata_optionselected',
                        value: json.option
                    });
                }

                var recordId = customRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: false
                });
                log.debug('onRequestFxn', 'recordId : ' + recordId);
            }
        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
            context.response.write(JSON.stringify({ recorId: recordId }));
        }
        context.response.write(JSON.stringify({ recorId: recordId }));
    }
    return {
        onRequest: onRequestFxn
    };
});