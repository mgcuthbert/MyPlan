# StravaTrainingPlan
A chrome Plugin that integrates a training plan into the Strava website.

## Features

### Activity Feed
At the top of the activity feed will include a quick view of the upcoming weeks training.

### Activity Page
Will include training details that would be associated with this training. The training details will include the following:
- What type of activity it is supposed to be
- Distance or duration of the training plan
- How close you fell within the distance or duration
- Pace associated with the training plan
- How close you fell within the pace
If no training associated with that date, then a reminder that you were supposed to rest, and then will check against how strenous the activity was and give some feedback.

### My Activities Page
Will include a link on the My Activities page that will pop open a big calendar view of the entire training plan, and then overlay the last 20 activities that would be shown in the list below onto your training plan to see how you are progressing. 

### Future Plans
The extension should grab the plans from Github, so it can use Github as a backend storage for your plans, so that you can have multiple plans over various periods. Each plan would have a date range, and it will work on a first come first serve basis, so if there are overlapping plans then it will only deal with one. But other plans for other date ranges, can be checked against.

#### Future Plans +
The calendar view is one of the best kind of views for the training plan, however it requires grabbing a specific set of activities of a specific time frame and I am pretty sure Strava would not have those API's open. If they were then building a separate website would be probably useful, but unfortunately it probably means that you would have to just deal with whatever activities are in the list in the "My Activities" page.

#### Future Plans ++
The other option would be to update Github with some basic information about the activity. However that would require some interesting workarounds to get that working properly.

## Github Training Plan
Training plans need to be built in a specific way and stored in public Github repo. The file needs to a CSV file with the following format:
ID, DATE (MM/DD/YYYY), EXPECTED_MILES, EXPECTED_PACE, TRAINING_NAME, TRAINING_DESCRIPTION

Once the file is saved, you can click on the "Raw" button to get the raw file. Copy the URL from the address bar and put it in the settings of the Chrome Extension. 

## TODO
- Create library file to manage the CSV Plan, with functions that will pull data from specific dates.
- Populate the training plan fields in the activity page
- For premium users add training dots to the training log.
- Add training column in the 'My Activities Page'
- Add a popup in the 'My Activities Page' to show a calendar for your entire training plan with the current activities included.
- Allow users to only include training plan for specific activities, make option available in the extension options.
    - See below for location, but will include the type after the name of the individual in the same location.
- Only include training plan on my runs, by allowing user to add strava id to options. 
    - id: heading -> header -> h2 -> span -> a -> link in A contains the athlete ID


## Build and Run
```js
 git clone https://github.com/mgcuthbert/StravaTrainingPlan.git
 cd StravaTrainingPlan
 npm install
 npm run build 
```
[load the build folder manually in chrome](https://github.com/mgcuthbert/StravaTrainingPlan)

Icons provided by <a href="https://www.flaticon.com/free-icons/cardio" title="cardio icons">Cardio icons created by ultimatearm - Flaticon</a>
