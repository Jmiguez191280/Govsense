/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(['N/record','N/runtime'],
    function(record,runtime) {
        function execute(context) {
            try { 
            var rcd = runtime.getCurrentScript().getParameter('custscript_recordId');
               log.debug('rcd', rcd);
                if(rcd)
                var id = record.submitFields({
                    type: 'customrecord_gs_pkng_parkingcitation',
                    id: rcd,
                    values: {
                        'custrecord_gs_coo_master_pin': '4C432'
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });

                log.debug('Id', id);
            } catch (e) {
               
            }
        }
        return {
            execute: execute
        };
    });

   