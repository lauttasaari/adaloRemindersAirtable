// Filter reminders table

const Constants = {

    PLANNED_REMINDERS_TABLE : "planned_reminders",
    PLANNED_REMINDERS_AXIS_FRENCH_FIELD : "axis_french",
    PLANNED_REMINDERS_DATE_STRING_FIELD : "date_string",
    PLANNED_REMINDERS_TASK_FIELD : "task",
    PLANNED_REMINDERS_PRIMARY_FIELD_DATE_STRING : "primary_field_date_string",
    PLANNED_REMINDERS_USER_ID : 'user_id',

    NOTIFICATION_TIMES_TABLE : "notification_times",
    NOTIFICATION_TIMES_HOUR_NUMBER_FIELD : "hour_number",
    NOTIFICATION_TIMES_PRIMARY_FIELD_USER_ID_FIELD : 'primary_field_user_id',
    NOTIFICATION_TIMES_USER_ID_FIELD : "user_id",

    PRIMARY_FIELD_NAME_IN_QUERY : "name",

    ADALO_APP_ID : '83fe3dd3-3a91-4243-b3a4-a7ffa8f18c35',
    ADALO_NOTIFICATIONS_API_URL : 'https://api.adalo.com/notifications',
}

// Load planned_reminders and notification_times tables
const plannedRemindersTable = base.getTable(Constants.PLANNED_REMINDERS_TABLE);
const plannedRemindersQuery = await plannedRemindersTable.selectRecordsAsync({
    fields: [
        Constants.PLANNED_REMINDERS_PRIMARY_FIELD_DATE_STRING,
        Constants.PLANNED_REMINDERS_AXIS_FRENCH_FIELD,
        Constants.PLANNED_REMINDERS_DATE_STRING_FIELD,
        Constants.PLANNED_REMINDERS_TASK_FIELD,
        Constants.PLANNED_REMINDERS_USER_ID,

    ]
})

const notificationTimesTable = base.getTable(Constants.NOTIFICATION_TIMES_TABLE);
const notificationTimesQuery = await notificationTimesTable.selectRecordsAsync({
    fields: [
        Constants.NOTIFICATION_TIMES_PRIMARY_FIELD_USER_ID_FIELD,
        Constants.NOTIFICATION_TIMES_HOUR_NUMBER_FIELD,
        Constants.NOTIFICATION_TIMES_USER_ID_FIELD,
    ]
})



// filter planned_reminders's primary field by today's date
let todayDateNumber = Date.now();
let todayDate = new Date(todayDateNumber);
let todayDateString = todayDate.toISOString().split('T')[0]
console.log({todayDateString})
const dateFilteredRecordsQuery = plannedRemindersQuery.records.filter(record => {
    // console.log(record[Constants.PRIMARY_FIELD_NAME_IN_QUERY], todayDateString) //debug
    if (record[Constants.PRIMARY_FIELD_NAME_IN_QUERY] === todayDateString){
        return record
    }
})
console.log({dateFilteredRecordsQuery})



// filter plannedReminders by hour

const dateFilteredPlannedReminders = dateFilteredRecordsQuery.map(record => {
    let plannedReminder = {};
    plannedReminder.userId = record.getCellValue(Constants.PLANNED_REMINDERS_USER_ID);
    plannedReminder.task = record.getCellValue(Constants.PLANNED_REMINDERS_TASK_FIELD);
    plannedReminder.axisFrench = record.getCellValue(Constants.PLANNED_REMINDERS_AXIS_FRENCH_FIELD);
    return plannedReminder
});

console.log(dateFilteredPlannedReminders)

const filteredReminders = dateFilteredPlannedReminders.filter(plannedReminder => {
    const notificationTimeRecordForUser = notificationTimesQuery.records.filter(record => {
        //console.log(record[Constants.PRIMARY_FIELD_NAME_IN_QUERY],String(plannedReminder.userId) )
        return String(record[Constants.PRIMARY_FIELD_NAME_IN_QUERY]) === String(plannedReminder.userId)
    })[0];
    const notificationTimeForUser = notificationTimeRecordForUser.getCellValue(Constants.NOTIFICATION_TIMES_HOUR_NUMBER_FIELD)
    console.log({notificationTimeForUser}, todayDate.getHours())
    if (notificationTimeForUser === todayDate.getHours()){
        return plannedReminder
    }
})

console.log(filteredReminders)




// http request builder
async function sendHttpRequest(user_email, titleText, bodyText){
    const body = {
        "appId": Constants.ADALO_APP_ID,
        "audience": { "email": user_email },
        "notification": {
            "titleText": titleText,
            "bodyText": bodyText,
        }
    }

    let response = await fetch(Constants.ADALO_NOTIFICATIONS_API_URL, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 8wmmvvcf0in5jm2cfmm4izbw4',
        },
    });

    return response
}


filteredReminders.forEach(
    function(reminder){


        console.log("the found date : ", findReminderDate(program.createdDate, reminder.day, program.week))
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
                    "date_string" : findReminderDate(program.createdDate, reminder.day, program.week),
                    "task": reminder.task,
                    "link1" : reminder.link1,
                    "link1_title" : reminder.link1Title
                }
            }
        )
    }
)

/*
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
*/