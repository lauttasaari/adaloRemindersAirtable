


const Constants = {
    PROGRAM_PARTICIPATIONS_TABLE : "program_participations",
    REMINDERS_TABLE : "reminder_list",
    REMINDERS_SYMPTOM_FIELD : "symptom",
    REMINDERS_AXIS_FIELD : "axis",
    REMINDERS_PROGRAM_LEVEL_FIELD : 'program_level',
    REMINDERS_TASK_FIELD : "task",
    REMINDERS_DAY_FIELD : "day",
    REMINDERS_CONTENT_LINK_FIELD : 'content_link',
    REMINDERS_CONTENT_TITLE_FIELD : 'content_title',
    REMINDERS_SOURCE_LINK_FIELD : 'source_link',
    REMINDERS_SOURCE_TITLE_FIELD : 'source_title',
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
program["createdDate"] = Date.now(); //inputConfig.programCreatedDate;

console.log("coucou")
console.log("createdDate from program_participation table : ", inputConfig.programCreatedDate);


const remindersTable = base.getTable(Constants.REMINDERS_TABLE);
const remindersQuery = await remindersTable.selectRecordsAsync({
    fields: [
        Constants.REMINDERS_SYMPTOM_FIELD,
        Constants.REMINDERS_AXIS_FIELD,
        Constants.REMINDERS_TASK_FIELD,
        Constants.REMINDERS_PROGRAM_LEVEL_FIELD,
        Constants.REMINDERS_CONTENT_LINK_FIELD,
        Constants.REMINDERS_CONTENT_TITLE_FIELD,
        Constants.REMINDERS_DAY_FIELD,
        Constants.REMINDERS_SOURCE_TITLE_FIELD,
        Constants.REMINDERS_SOURCE_LINK_FIELD,
    ]
})


const symptomFilteredRecordsQuery = remindersQuery.records.filter(record => record.name.includes(program.symptom))


const symptomFilteredReminders = symptomFilteredRecordsQuery.map(record => {
    let reminder = {};
    reminder.axis = record.getCellValue(Constants.REMINDERS_AXIS_FIELD);
    reminder.symptom = record.getCellValue(Constants.REMINDERS_SYMPTOM_FIELD);
    reminder.task = record.getCellValue(Constants.REMINDERS_TASK_FIELD);
    reminder.programLevel = record.getCellValue(Constants.REMINDERS_PROGRAM_LEVEL_FIELD);
    reminder.contentTitle = record.getCellValue(Constants.REMINDERS_CONTENT_TITLE_FIELD);
    reminder.contentLink = record.getCellValue(Constants.REMINDERS_CONTENT_LINK_FIELD);
    reminder.sourceTitle = record.getCellValue(Constants.REMINDERS_SOURCE_TITLE_FIELD);
    reminder.sourceLink = record.getCellValue(Constants.REMINDERS_SOURCE_LINK_FIELD);
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

// if starts next monday, function not used anymore
function findReminderDateMondayVersion(date, reminderDay, programWeek){
    let dateObject = new Date(date);
    let dayOfWeek = dateObject.getDay(); // monday = 1, tuesday = 2 etc
    let reminderDate = dateObject.addDays(-dayOfWeek + 7 * programWeek + reminderDay);
    let reminderDateObject = new Date(reminderDate);
    return reminderDateObject.toLocaleDateString('en-US')  // adalo is on US language date formats mm/dd/yyyy
}

// if starts next monday, function not used anymore
function findReminderDate(date, reminderDay, programWeek){
    let dateObject = new Date(date);
    let reminderDate = dateObject.addDays(7 * (programWeek - 1) + reminderDay - 1); // first reminder is the current day
    let reminderDateObject = new Date(reminderDate);
    return [reminderDateObject, reminderDateObject.toLocaleDateString('fr-FR')] // adalo is on language of browser (jane's google chrome) date formats --> Ddd/mm/yyyy
}


// if starts next monday, function not used anymore
function findReminderDate(date, reminderDay, programWeek){
    let dateObject = new Date(date);
    let reminderDate = dateObject.addDays(7 * (programWeek - 1) + reminderDay); // first reminder is just the next day
    let reminderDateObject = new Date(reminderDate);
    return reminderDateObject.toISOString().split('T')[0] // // yyyy-mm-dd corresponds to adalo s No Formatting of dates
}

plannedRemindersToCreate = []
filteredReminders.forEach(
    function(reminder){
        let dateString = findReminderDate(program.createdDate, reminder.day, program.week);
        console.log("the found date : ", dateString)
        let userIdCheck = (typeof program.userId == "number")
        let dateStringCheck = (dateString.length > 8)
        if (userIdCheck && dateStringCheck) { // created these checks because one IF and one SEARCH in adalo program page (so if userId is null and date is X, too many tasks will come out on date X)
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
                        "date_string" : dateString,
                        "task": reminder.task,
                        "content_link" : reminder.contentLink,
                        "content_title" : reminder.contentTitle,
                        "source_link" : reminder.sourceLink,
                        "source_title" : reminder.sourceTitle,
                        "user_id_and_date_string" : String(program.userId) + " - " + dateString
                    }
                }
            )
        } else {
            console.error("issue with userID " + program.userId + " or dateString " + dateString)
        }
    }
)


console.log(plannedRemindersToCreate)
let plannedRemindersTable = base.getTable("planned_reminders");
let recordIds = await plannedRemindersTable.createRecordsAsync(plannedRemindersToCreate);
console.log("Created " + recordIds.length + " records!");