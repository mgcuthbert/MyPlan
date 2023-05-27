import { months } from "../utils";

export function buildCalendarView(planName:string, planData:any, useMi:boolean, planGoal:string) {
    let header = document.getElementById("calendar-header") as HTMLElement;
    if (header) {
        addNextPreviousEventListener(header, planName, planData, useMi, planGoal);
        let year = Number((header.querySelector("h2.heading-nav span.nav-group a") as HTMLElement).innerText);
        let monthElement = header.querySelector("h2.heading-nav span.active span.month-display") as HTMLElement;
        if (monthElement) {
            let month = (monthElement).innerText;
            let monthNum = -1;
            for (let m of months) {
                monthNum += 1;
                if (m === month || m.substring(0, 3) === month) {
                    break; 
                }
            }
            // filter out training days that are not in the current month
            const filteredKeys = Object.keys(planData.data).filter((dateKey:string) => {
                const millis = dateKey.split("-")[0];
                return isDateInYearAndMonth(new Date(Number(millis)), year, monthNum);
            }).sort();
            addGoal(planGoal);
            
            // now that I have the filtered data, I need to find where to put each piece of data.
            let calendarTBody = document.querySelector("div.view div.page div.content table.month-calendar tbody") as HTMLElement;
            const firstDayOfMonth = new Date(year, monthNum, 1).getUTCDay();
            for (let key of filteredKeys) {
                const currentData = planData.data[key];
                const newElement = buildNewTrainingElement(currentData, useMi);
                const currentDay = new Date(currentData.date).getUTCDate();
                const {row, column} = getRowAndColumn(currentDay, firstDayOfMonth);
                const insertPoint = calendarTBody.querySelector(`tr:nth-child(${row}) td:nth-child(${column}) ul.activities`) as HTMLElement;
                insertPoint.appendChild(newElement);
            }
        }
    }
};

function addNextPreviousEventListener(header:HTMLElement, planName:string, planData:any, useMi:boolean, planGoal:string) {
    // Can't get this piece of code work correctly, and don't feel like troubleshooting it.
    // so for now you have to refresh your page if you want to see everything on the calendar.
    /*const nextButton = header.querySelector("h2.heading-nav span.active a.nav-arrow-icon.next") as HTMLElement;
    nextButton.removeEventListener('mousedown', () => buildCalendarView(planName, planData, useMi, planGoal));
    nextButton.addEventListener('mousedown', () => buildCalendarView(planName, planData, useMi, planGoal));

    const prevButton = header.querySelector("h2.heading-nav span.active a.nav-arrow-icon.prev") as HTMLElement;
    prevButton.removeEventListener('mousedown', () => buildCalendarView(planName, planData, useMi, planGoal));
    prevButton.addEventListener('mousedown', () => buildCalendarView(planName, planData, useMi, planGoal));*/
}

function addGoal(planGoal:string) {
    const insertPoint = document.querySelector("body div.view div.page");
    let goalElement = document.createElement("div");
    goalElement.className = "mb-sm";
    goalElement.innerHTML = `<b>Goal: </b>${planGoal}`;
    insertPoint?.firstElementChild?.insertAdjacentElement("afterend", goalElement);
}

function buildNewTrainingElement(data:any, useMi:boolean): HTMLElement {
    let metric = "mi";
    if (!useMi) {
        metric = "km";
    }
    let newElement = document.createElement("li");
    newElement.className = "cycling";
    newElement.innerHTML = `
        ${data.title} - ${data.distance}${metric} @ ${data.paceMinutes}:${data.paceSeconds}/${metric}
    `;
    return newElement;
}

function isDateInYearAndMonth(date:Date, year:number, month:number) {
    const dateYear = date.getUTCFullYear();
    const dateMonth = date.getUTCMonth();
    return dateYear === year && dateMonth === month;
}

function getRowAndColumn(dayOfMonth:number, startDayOfWeek:number) {
    const numCols = 7; // Number of columns in the calendar grid
    // Calculate the row and column based on the day of the month
    let updatedDay = startDayOfWeek;
    if (startDayOfWeek === 0) {
        updatedDay = 7;
    }
    let updateDayOfMonth = dayOfMonth + updatedDay - 1;
    const row = Math.ceil(updateDayOfMonth / numCols);
    const column = updateDayOfMonth - (numCols * (row-1));
    return { row, column };
}