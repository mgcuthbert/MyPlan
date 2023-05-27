import { months } from "../utils";

export function buildCalendarView(planName:string, planData:any, useMi:boolean, planGoal:string) {
    let header = document.getElementById("calendar-header");
    if (header) {
        let year = Number((header.querySelector("h2.heading-nav span.nav-group a") as HTMLElement).innerText);
        let monthElement = header.querySelector("h2.heading-nav span.active span.month-display") as HTMLElement;
        if (monthElement) {
            let month = (monthElement).innerText;
            let monthNum = -1;
            for (let m of months) {
                monthNum += 1;
                if (m === month) {
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
            for (let key of filteredKeys) {
                const currentData = planData.data[key];
                console.log(currentData);
                const newElement = buildNewTrainingElement(currentData, useMi);
                const currentDayOfMonth = new Date(currentData.date).getUTCDate();
                console.log(currentDayOfMonth);
                const {row, column} = getRowAndColumn(currentDayOfMonth);
                const insertPoint = calendarTBody.querySelector(`tr:nth-child(${row}) td:nth-child(${column}) ul.activities`) as HTMLElement;
                insertPoint.appendChild(newElement);
            }
        }
    }
};

function addGoal(planGoal:string) {
    const insertPoint = document.querySelector("body div.view div.page");
    let goalElement = document.createElement("div");
    goalElement.className = "mb-sm";
    goalElement.innerHTML = `<b>Goal:</b>${planGoal}`;
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
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    return dateYear === year && dateMonth === month;
}

function getRowAndColumn(dayOfMonth:number) {
    const numCols = 7; // Number of columns in the calendar grid
  
    // Calculate the row and column based on the day of the month
    const row = Math.ceil(dayOfMonth / numCols);
    const column = dayOfMonth - (numCols * (row-1));
    return { row, column };
}