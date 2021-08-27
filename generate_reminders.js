


const Constants = {
    PROGRAM_PARTICIPATIONS_TABLE : "program_participations",
    REMINDERS_TABLE : "reminder_list",
    REMINDERS_SYMPTOM_FIELD : "symptom",
    REMINDERS_AXIS_FIELD : "axis",
    REMINDERS_PROGRAM_LEVEL_FIELD : 'program_level',
    REMINDERS_TASK_FIELD : "task",
    REMINDERS_DAY_FIELD : "day",
    REMINDERS_LINK1TITLE_FIELD : 'link1Title',
    REMINDERS_LINK1_FIELD : 'link1',

}


let inputConfig = input.config();
var program = {};
program["programParticipationId"] = inputConfig.programParticipationId;
program["symptom"] = inputConfig.programSymptom;
program["symptomFrench"] = inputConfig.programSymptomFrench;
program["axis"] = inputConfig.programAxis;
program["axisFrench"] = inputConfig.programAxisFrench;
program["level"] = inputConfig.programLevel;
program["week"] = inputConfig.programWeek;
program["userId"] = inputConfig.userId;
program["createdDate"] = Date.now();//inputConfig.programCreatedDate;

console.log("createdDate from program_participation table : ", inputConfig.programCreatedDate);


const remindersTable = base.getTable(Constants.REMINDERS_TABLE);
const remindersQuery = await remindersTable.selectRecordsAsync({
    fields: [
        Constants.REMINDERS_SYMPTOM_FIELD,
        Constants.REMINDERS_AXIS_FIELD,
        Constants.REMINDERS_TASK_FIELD,
        Constants.REMINDERS_PROGRAM_LEVEL_FIELD,
        Constants.REMINDERS_LINK1_FIELD,
        Constants.REMINDERS_LINK1TITLE_FIELD,
        Constants.REMINDERS_DAY_FIELD,
    ]
})


const symptomFilteredRecordsQuery = remindersQuery.records.filter(record => record.name.includes(program.symptom))


const symptomFilteredReminders = symptomFilteredRecordsQuery.map(record => {
    let reminder = {};
    reminder.axis = record.getCellValue(Constants.REMINDERS_AXIS_FIELD);
    reminder.symptom = record.getCellValue(Constants.REMINDERS_SYMPTOM_FIELD);
    reminder.task = record.getCellValue(Constants.REMINDERS_TASK_FIELD);
    reminder.programLevel = record.getCellValue(Constants.REMINDERS_PROGRAM_LEVEL_FIELD);
    reminder.link1Title = record.getCellValue(Constants.REMINDERS_LINK1TITLE_FIELD);
    reminder.link1 = record.getCellValue(Constants.REMINDERS_LINK1_FIELD);
    reminder.day = record.getCellValue(Constants.REMINDERS_DAY_FIELD);
    return reminder
});

const filteredReminders = symptomFilteredReminders.filter(reminder =>
    reminder.task !== null
    && reminder.axis.includes(program.axis)
    && reminder.programLevel === program.level

)


Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function findReminderDate(date, reminderDay, programWeek){
    let dateObject = new Date(date);
    let dayOfWeek = dateObject.getDay(); // monday = 1, tuesday = 2 etc
    let reminderDate = dateObject.addDays(-dayOfWeek + 7 * programWeek + reminderDay);
    let reminderDateObject = new Date(reminderDate);
    return reminderDateObject.toLocaleDateString('en-US')  // adalo is on US language date formats mm/dd/yyyy
}


plannedRemindersToCreate = []
filteredReminders.forEach(
    function(reminder){
        plannedRemindersToCreate.push(
            {
                fields : {
                    "user_id" : program.userId,
                    "symptom" : reminder.symptom,
                    "symptom_french" : program.symptomFrench,
                    "axis" : reminder.axis,
                    "axis_french" : program.axisFrench,
                    "week" : program.week,
                    "day_of_week" : reminder.day,
                    "date" : findReminderDate(program.createdDate, reminder.day, program.week),
                    "task": reminder.task,
                    "link1" : reminder.link1,
                    "link1_title" : reminder.link1Title
                }
            }
        )
    }
)

console.log(plannedRemindersToCreate)
let plannedRemindersTable = base.getTable("planned_reminders");
let recordIds = await plannedRemindersTable.createRecordsAsync(plannedRemindersToCreate);
console.log("Created " + recordIds.length + " records!");