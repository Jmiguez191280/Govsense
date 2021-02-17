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
            json = JSON.parse(unescape(json));
            var otherId;
            if (json && json.email) {
                otherId = record.submitFields({
                    type: 'customer',
                    id: json.customerId,
                    values: {
                        'email': json.email
                    }
                });
             
                log.debug('onRequestFxn', 'otherId : ' + otherId);
            }
        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
            
        }
        context.response.write(JSON.stringify({ recorId: otherId }));
    }
    return {
        onRequest: onRequestFxn
    };
});