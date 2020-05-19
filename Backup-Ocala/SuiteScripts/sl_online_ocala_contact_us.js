/**
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 */

define(['N/https', 'N/record', 'N/email', 'N/search', 'N/file', './handlebars-v4.0.5.js'], function(https, record, email, search, file, hb) {

    var CONTACT_US_TEMPLATE_FILE_ID = 360404;

    function showHomePage(context, isSubmit) {

        // log.audit('getFunction', 'Context object : ' +
        // JSON.stringify(context));

        var objData = {
            submit: isSubmit
        };

        var fileObj = file.load({
            id: CONTACT_US_TEMPLATE_FILE_ID
        });

        log.audit('fileObj.getName()', fileObj.name);

        var template = hb.compile(fileObj.getContents());

        context.response.write(template(objData));

    }

    function onRequestFxn(context) {

        try {

            var submit = '';

            if (context.request.method === 'POST') {

                var params = context.request.parameters;
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