/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file', './handlebars-v4.0.5.js'], function(https, record, email, search, file, hb) {



    function showHomePage(context, isSubmit) {


        var objData = {
            submit: isSubmit
        };


        log.audit('tesst', JSON.stringify(objData));
        context.response.write(JSON.stringify(objData));

    }

    function onRequestFxn(context) {

        try {

            var submit = '';

            if (context.request.method === 'POST') {

                var params = context.request.parameters;
                params = JSON.parse(params.parameters)
                log.audit('onRequestFxn | POST', 'Context parameters : ' + JSON.stringify(params));

                // Create Contact (custom) record
                var rec = record.create({
                    type: 'customrecord_gs_coo_onlinefeedback'
                });

                rec.setValue('custrecord_gs_coo_feedback_companyname', params.compname);
                rec.setValue('custrecord_gs_coo_feedback_firstname', params.firstname);
                rec.setValue('custrecord_gs_coo_feedback_lastname', params.lastname);
                rec.setValue('custrecord_gs_coo_feedback_emailaddress', params.email);
                rec.setValue('custrecord_gs_coo_feedback_phonenumber', params.phone);
                rec.setValue('custrecord_gs_coo_feedback_title', params.feedbacksumm);
                rec.setValue('custrecord_gs_coo_feedback_details', params.feedbackdetails);

                var id = rec.save();
                log.audit('onRequestFxn', 'Created Online Feedback record | id : ' + id);
                submit = 'T'
            }
            showHomePage(context, submit);

        } catch (e) {
            log.error('onRequestFxn', 'ERROR : ' + e);
        }
    }
    return {
        onRequest: onRequestFxn
    };
});