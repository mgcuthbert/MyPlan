export function buildDashboardView(planName:string, planData:any) {
    const feedDiv = document.getElementById('dashboard-feed');
    if (feedDiv) {
        const newDiv:HTMLDivElement = document.createElement('div');
        newDiv.className = "card";
        const filteredKeys = Object.keys(planData.data).filter((dateKey:string) => {
            const millis = dateKey.split("-")[0];
            return Number(millis) > Date.now() && Number(millis) <= Date.now() + 6.048e+8;
        }).sort();
        if (filteredKeys.length === 0) {
            var daysBetween = planData.startTraing - new Date().getTime();
            daysBetween = Math.floor(daysBetween / (1000*60*60*24));
            newDiv.innerHTML = `
            <div class="card-body text-left">
                <div class="card-section">
                    <h2 class="text-title2 mt-sm mb-md">
                        ${planName}
                    </h2>
                    Training starting in <b>${daysBetween}</b> days: <br/>
                    <b>${new Date(planData.startTraing).toDateString()}</b> through <b>${new Date(planData.endTraining).toDateString()}</b>
                </div>    
            </div>
            `;
        } else {
            let innerHTML = `
                <div class="card-body text-left">
                    <div class="card-section">
                        <h2 class="text-title2 mt-sm mb-md">
                            ${planName}
                        </h2>
                        Training for the next week.
                    </div>
            `;
            let totalDistance = 0;
            filteredKeys.forEach((key:any) => {
                const currentPlan = planData.data[key];
                let paceSeconds = currentPlan.paceSeconds;
                if (paceSeconds < 10) {
                    paceSeconds = "0" + paceSeconds;
                }
                totalDistance += currentPlan.distance;
                const currentDate = new Date(currentPlan.date);
                innerHTML += `
                    <div class="card-section">
                        <ul class="list-stats text-left">
                            <li>
                                <div>
                                    <b>${currentPlan.title}</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Date</b></div>
                                    <b class="stat-subtext">${currentDate.toLocaleDateString("en-US")}</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Day</b></div>
                                    <b class="stat-subtext">${currentDate.toLocaleDateString("en-US", { weekday: 'long'})}</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Distance</b></div>
                                    <b class="stat-subtext">${currentPlan.distance}</b>
                                <div class="stat">
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Pace</b></div>
                                    <b class="stat-subtext">${currentPlan.paceMinutes + ":" + paceSeconds} / mi</b>
                                </div>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <div class="stat">
                                    <b class="stat-subtext">${currentPlan.description}</b>
                                </div>
                            </li>
                        </ul>
                    </div>
                `;
            });
            innerHTML += `
                    <div class="card-footer text-right">
                        A total of <b>${totalDistance}</b> miles planed for the next 7 days.    
                    </div>
                </div>
            `;
            newDiv.innerHTML = innerHTML;
        }
        newDiv.style["marginTop"] = "20px";
        feedDiv.insertBefore(newDiv, feedDiv.firstChild);
    }
};