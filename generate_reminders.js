const Constants = {
    PROGRAM_PARTICIPATIONS_TABLE : "program_participations",
    REMINDERS_TABLE : "reminder_list",
    REMINDERS_SYMPTOM_FIELD : "symptom",
    REMINDERS_AXIS_FIELD : "axis"
}


let inputConfig = input.config();
const programParticipationId = inputConfig.programParticipationId;
const programSymptom = inputConfig.programSymptom;
const programAxis = inputConfig.programAxis;
const programLevel = inputConfig.programLevel;



const remindersTable = base.getTable(Constants.REMINDERS_TABLE);
const remindersQuery = await remindersTable.selectRecordsAsync({
    fields: [
        Constants.REMINDERS_SYMPTOM_FIELD,
        Constants.REMINDERS_AXIS_FIELD
    ]
})


const symptomFilteredRecordsQuery = remindersQuery.records.filter(record => record.name.includes(programSymptom))


const symptomFilteredReminders = symptomFilteredRecordsQuery.map(record => {
    let reminder = {};
    reminder.axis = record.getCellValue(Constants.REMINDERS_AXIS_FIELD);
    reminder.symptom = record.getCellValue(Constants.REMINDERS_SYMPTOM_FIELD);
    return reminder
});

const filteredReminders = symptomFilteredReminders.filter(reminder =>
    reminder.axis.includes(programAxis) && reminder.level.includes(programLevel)
)


console.log(Date.now())

const mondays = [new Date('August 30, 2021')]
// TODO separate level in reminders excel :)
//TODO generate reminders for right days of week


/*
// Create three records in the Tasks table
let table = base.getTable("planned_reminders");
let recordIds = await table.createRecordsAsync([
    {
        fields: {
            "user_id" : 1,
            "symptom" : "test"
        },
    }
]);
console.log("Created " + recordIds.length + " records!");

*/