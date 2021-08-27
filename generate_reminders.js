


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
const programParticipationId = inputConfig.programParticipationId;
const programSymptom = inputConfig.programSymptom;
const programAxis = inputConfig.programAxis;
const programLevel = inputConfig.programLevel;
const programWeek = inputConfig.programWeek;
const userId = inputConfig.userId;



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


const symptomFilteredRecordsQuery = remindersQuery.records.filter(record => record.name.includes(programSymptom))


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
    && reminder.axis.includes(programAxis)
    && reminder.programLevel === programLevel

)

console.log(filteredReminders)

console.log(Date.now())

const mondays = [new Date('August 30, 2021')]
// TODO separate level in reminders excel :)
//TODO generate reminders for right days of week

let plannedRemindersToCreate = [];

filteredReminders.forEach(
    function(reminder){
        plannedRemindersToCreate.push(
            {
                fields : {
                    "user_id" : userId,
                    "symptom" : reminder.symptom,
                    "symptom_french" : "",
                    "axis" : reminder.axis,
                    "axis_french" : "",
                    "week" : programWeek,
                    "day_of_week" : reminder.day,
                    "date" : "30/08/2021",
                    "task": reminder.task,
                    "link1" : reminder.link1,
                    "link1_title" : reminder.link1Title,
                }
            }
        )
    }
)

console.log(plannedRemindersToCreate)
let plannedRemindersTable = base.getTable("planned_reminders");
let recordIds = await plannedRemindersTable.createRecordsAsync(plannedRemindersToCreate);
console.log("Created " + recordIds.length + " records!");