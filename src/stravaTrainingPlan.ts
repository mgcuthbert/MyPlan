const updateDom = async (): Promise<void> => {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        chrome.runtime.sendMessage("TestTrainingPlan", handleResponse);
    } else {
        console.log("Heading Not Found, training plan could not be integrated!");
    }
};

function handleResponse(data:string) {
    let storedData = chrome.storage.local.get(["plan"]).then((result) => {
        buildPlan(result.plan);
    });
}

function buildPlan(data:string) {
    console.log(data);
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        const childHeadingDiv:ChildNode = headingDiv.childNodes[3];
        // PARENT DIV
        const newDiv:HTMLDivElement = document.createElement('div');
        newDiv.className = 'border-top-light';
        newDiv.innerHTML = `<div class="no-margins row">
            <header style="display: block;" class="inset">
                <b>TRAINING PLAN:</b>
                ${data}
            </header>
            <div class="inset">
                <ul class="inline-stats section spans12">
                    <li>
                        <strong>8</strong>
                        <abbr class="unit" title="miles">mi</abbr></strong>
                        <div class="label">Expected Distance</div>
                    </li>
                    <li>
                        <strong>5</strong>
                        <abbr class="unit" title="miles">mi</abbr></strong>
                        <div class="label">Distance Difference</div>
                    </li>
                    <li>
                        <strong>8</strong>
                        <abbr class="unit" title="minutes per mile">/mi</abbr></strong>
                        <div class="label">Expected Pace</div>
                    </li>
                    <li>
                        <strong>0:45</strong>
                        <abbr class="unit" title="minutes per mile">/mi</abbr></strong>
                        <div class="label">Pace Difference</div>
                    </li>
                </ul>
            </div>
        <div/>
        `;

        childHeadingDiv.appendChild(newDiv);
    }
} 

updateDom();
