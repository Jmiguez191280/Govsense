/**
   * User Event 2.0 
   *
   * @NApiVersion 2.x
   * @NModuleScope SameAccount
   * @NScriptType UserEventScript
   * 
   */

  define(["N/error", 'N/task', 'N/record'], function (err, task, record) {

    var exports = {};

    function afterSubmit(scriptContext) {

        try {
            if (scriptContext.type === scriptContext.UserEventType.CREATE) {
                var newRecd = scriptContext.newRecord;
                var pin = '';
                var soId=newRecd.id;
                 log.debug('soId', soId);
                if (newRecd) {
                  
                    var scheduledScript = task.create({
                        taskType: task.TaskType.SCHEDULED_SCRIPT
                    });
                    scheduledScript.scriptId = 'customscript_set_m_pin';
                    scheduledScript.deploymentId = 'customdeploy1';
                    scheduledScript.params = {
                        'custscript_recordId': soId
                    };

                    var mrTaskId = scheduledScript.submit();
                    log.debug('taskId', mrTaskId);
                }
            }
        } catch (e) {
          log.debug('Error', e);
        }
    }
    return {  
        afterSubmit: afterSubmit
    };

  
});