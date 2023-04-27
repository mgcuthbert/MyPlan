const debugDiv = document.getElementById('debug');
function log(text: any) {
  if (debugDiv) {
    debugDiv.innerText = text;
  }
};

// PLAN URL
const planURL = document.getElementById('planURL') as HTMLInputElement;
planURL?.addEventListener('change', () => saveOptions());

// ATHLETE ID
const athleteId = document.getElementById('athleteId') as HTMLInputElement;
athleteId?.addEventListener('change', () => saveOptions());

// ACTIVITY TYPES
const activityList = ['run', 'ride', 'walk', 'workout', 'hike', 'swim'];
const inputMap = new Map<string, HTMLInputElement>();
activityList.forEach((type) => {
  const typeInput = document.getElementById(type) as HTMLInputElement;
  typeInput?.addEventListener('change', () => saveOptions());
  inputMap.set(type, typeInput);
});

// MEASUREMENTS
const miRadio = document.getElementById('mi') as HTMLInputElement;
miRadio.addEventListener('change', () => saveOptions());
const kmRadio = document.getElementById('km') as HTMLInputElement;
kmRadio.addEventListener('change', () => saveOptions());

function getActivityList() : string[] {
  let setList: string[] = [];
  inputMap.forEach((value, key) => {
    if (value.checked) {
      setList.push(key);
    }
  });
  return setList; 
}

function saveOptions() {
  const currentOptions = {
    athleteId: Number(athleteId.value),
    planURL: planURL.value,
    activityTypes: getActivityList(),
    useMi: miRadio.checked,
  }
  chrome.storage.local.set({planOptions: currentOptions});
};

chrome.storage.local.get('planOptions').then(options => {
  const currentOptions = options.planOptions;
  if (currentOptions) {
    if (currentOptions.planURL) {
      planURL.value = currentOptions.planURL;
    }

    if (currentOptions.athleteId && currentOptions.athleteId !== 0) {
      athleteId.value = currentOptions.athleteId;
    }

    if (currentOptions.useMi) {
      miRadio.checked = true;
    } else {
      kmRadio.checked = true;
    }

    let currentActivityTypes = ['run'];
    if (currentOptions.activityTypes) {
      currentActivityTypes = currentOptions.activityTypes;
    }
    if (currentActivityTypes.length === 0) {
      currentActivityTypes = ['run'];
    }
    currentActivityTypes.forEach((type) => {
      var typeInput = inputMap.get(type);
      if (typeInput) {
        typeInput.checked = true;
      }
    });
  }
});
