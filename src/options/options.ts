const debugDiv = document.getElementById('debug');
function log(text: any) {
  if (debugDiv) {
    debugDiv.innerText = text;
  }
}

// PLAN URL
const planURL = document.getElementById('planURL') as HTMLInputElement;
chrome.storage.local.get('planURL', (result) => {
  const value = result.planURL;
  if (planURL && value) {
    planURL.value = value;
  }
});

planURL?.addEventListener('change', () => {
  chrome.storage.local.set({
    planURL: planURL.value,
  });
});

// ATHLETE ID
const athleteId = document.getElementById('athleteId') as HTMLInputElement;
chrome.storage.local.get('athleteId', (result) => {
  const value = result.athleteId;
  if (athleteId && value) {
    athleteId.value = value;
  }
});

athleteId?.addEventListener('change', () => {
  chrome.storage.local.set({
    athleteId: athleteId.value,
  });
});

// ACTIVITY TYPE
const activityList = ['run', 'ride', 'walk', 'workout', 'hike', 'swim'];
const inputMap = new Map<string, HTMLInputElement>();
activityList.forEach((type) => {
  const typeInput = document.getElementById(type) as HTMLInputElement;
  typeInput?.addEventListener('change', () => updateActivityType());
  inputMap.set(type, typeInput);
});

chrome.storage.local.get('activityTypes', (result) => {
  let currentActivityTypes = ['run'];
  if (!result || !result.activityType) {
    currentActivityTypes = result.activityTypes;
  }

  if (currentActivityTypes.length == 0) {
    currentActivityTypes = ['run'];
  }
  currentActivityTypes.forEach((type) => {
    var typeInput = inputMap.get(type);
    if (typeInput) {
      typeInput.checked = true;
    }
  });
});

function updateActivityType() {
  let setList: string[] = [];
  inputMap.forEach((value, key) => {
    if (value.checked) {
      setList.push(key);
    }
  });
  chrome.storage.local.set({ activityTypes: setList });
}

// MEASUREMENTS
const miRadio = document.getElementById('mi') as HTMLInputElement;
miRadio.addEventListener('change', () => setMeasurementStorage());
const kmRadio = document.getElementById('km') as HTMLInputElement;
kmRadio.addEventListener('change', () => setMeasurementStorage());

chrome.storage.local.get('useMi', (result) => {
  if (result.useMi) {
    miRadio.checked = true;
    kmRadio.checked = false;
  } else {
    kmRadio.checked = true;
    miRadio.checked = false;
  }
});

function setMeasurementStorage() {
  if (miRadio.checked) {
    chrome.storage.local.set({ useMi: true });
  } else {
    chrome.storage.local.set({ useMi: false });
  }
}
