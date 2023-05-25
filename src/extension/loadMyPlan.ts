import { buildCalendarView } from "./views/calendarView";
import { buildActivityView, buildNoTraining } from "./views/activityView";
import { buildDashboardView } from "./views/dashboardView";

// Some globals - yeah I know you no one likes globals.
// I am not trying to win any awards for clean code here.
let planOptions:any = undefined;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function buildPlan(planName:string, planData:any) {
    // check which page we are on and work based on that
    if (location.href.match("activities")) {
        console.log("Updating activities page...");
        buildActivityView(planData, planOptions);
    } else if (location.href.match("dashboard")) {
        console.log("Updating dashboard page...");
        buildDashboardView(planName, planData);
    } else if (location.href.match("calendar")) {
        console.log("Updating calendar page...");
        buildCalendarView();
    }
};

function handleResponse(status:string) {
    console.log(status);
    chrome.storage.local.get([planOptions.planName], (planData) => {
        if (planData) {
            buildPlan(planOptions.planName, planData[planOptions.planName]);
        }
    });
};

const updateDom = async (): Promise<void> => {
    chrome.storage.local.get('planOptions', (options) => {
        planOptions = options.planOptions;
        chrome.storage.local.get([planOptions.planName], (planData) => {
            if (planData && Date.now() - planData.tombstone < 86400000) {
                buildPlan(planOptions.planName, planData[planOptions.planName]);
            } else {
                chrome.runtime.sendMessage(planOptions.planName, handleResponse);
            }
        });
    });
};

updateDom();