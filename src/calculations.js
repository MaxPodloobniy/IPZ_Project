const suncalc = require('suncalc3');
function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function convertToDate(DateString) {
    const [year, month, day, hour, minute] = DateString.split(/-|T|:/);
    return new Date(year, month, day, hour, minute);
}
function get_Moon_height(currDate, latitude, longitude) {
    const moon = SunCalc.getMoonPosition(currDate, latitude, longitude);
    return moon.altitudeDegrees;
}

function when_sets_rises(dateTimeString, latitude, longitude) {
    const currDate = convertToDate(dateTimeString);
    const currHeight = get_Moon_height(currDate, latitude, longitude);
    let prev_Time = currDate.getTime();
    let prev_Height = currHeight;
    let next_Time = 0;
    let next_Height = 0;
    let List_for_x = [];
    let List_for_y = [];
    // List where first el is time when Moon rises second when sets and third when maximal
    let when_rises_sets_max = [0, 0, 0, 0]
    let max_height = 0;
    let max_time = 0;

    for (let i = 1; i < 1440; i++){
        next_Time = prev_Time + (60 * 1000);
        next_Height = get_Moon_height(next_Time, latitude, longitude);
        List_for_x.push(next_Time);
        List_for_y.push(next_Height);

        if (prev_Height < 0 && next_Height > 0){
            when_rises_sets_max[0] = next_Time;
        } else if (prev_Height > 0 && next_Height < 0){
            when_rises_sets_max[1] = next_Time;
        }
        if (max_height < next_Height){
            max_height = next_Height;
            max_time = next_Time;
        }
        prev_Time = next_Time;
        prev_Height = next_Height;
    }
    when_rises_sets_max[2] = max_time;
    return [List_for_x, List_for_y];
}

function getXAxis(data_y, y) {
    for (let i = 0; i < data_y.length; i++){
        if (data_y[i-1] * data_y[i] < 0){
            return y[i];
        }
    }
}

function getGraphXCoordinates(x, graphWidth) {
    const minX = Math.min(...x);
    const maxX = Math.max(...x);

    // Масштабування значень x до розмірів графіка
    const scaleX = graphWidth / (maxX - minX);

    // Повернення масиву значень координат x
    return x.map((value) => (value - minX) * scaleX);
}

function getGraphYCoordinates(y, graphHeight) {
    const minY = Math.min(...y);
    const maxY = Math.max(...y);

    // Масштабування значень y до розмірів графіка
    const scaleY = graphHeight / (maxY - minY);

    // Повернення масиву значень координат y
    return y.map((value) => graphHeight - (value - minY) * scaleY);
}

function getMoonImgPhase(Phase) {
    return Math.floor(Phase/239/8)+1;
}

function findMoonRisesSets(dateTimeString, latitude, longitude) {
    // First str time when rises second when sets
    let result = ['', ''];
    const currDate = convertToDate(dateTimeString);
    const height = get_Moon_height(currDate, latitude, longitude);


    let dateCounter = currDate;
    if(height > 0){
        for (let i = 0; i < 1440; i++){
            const newDate = new Date(dateCounter.getTime() + 1000*60);
            if (get_Moon_height(dateCounter, latitude, longitude) > 0 && get_Moon_height(newDate, latitude, longitude) < 0){
                const hours = ("00" + newDate.getHours().toString()).slice(-2);
                const minutes = ("00" + newDate.getMinutes().toString()).slice(-2);
                result[1] = hours + ':' + minutes;
            }
            dateCounter = newDate;
        }
        dateCounter = currDate;
        for (let i = 0; i < 1440; i++){
            const newDate = new Date(dateCounter.getTime() - 1000*60);
            if (get_Moon_height(dateCounter, latitude, longitude) > 0 && get_Moon_height(newDate, latitude, longitude) < 0){
                const hours = ("00" + newDate.getHours().toString()).slice(-2);
                const minutes = ("00" + newDate.getMinutes().toString()).slice(-2);
                result[0] = hours + ':' + minutes;
            }
            dateCounter = newDate;
        }
    } else if(height < 0){
        for (let i = 0; i < 1440; i++){
            const newDate = new Date(dateCounter.getTime() + 1000*60);
            if (get_Moon_height(dateCounter, latitude, longitude) < 0 && get_Moon_height(newDate, latitude, longitude) > 0){
                const hours = ("00" + newDate.getHours().toString()).slice(-2);
                const minutes = ("00" + newDate.getMinutes().toString()).slice(-2);
                result[0] = hours + ':' + minutes;
            }
            dateCounter = newDate;
        }
        dateCounter = currDate;
        for (let i = 0; i < 1440; i++){
            const newDate = new Date(dateCounter.getTime() - 1000*60);
            if (get_Moon_height(dateCounter, latitude, longitude) < 0 && get_Moon_height(newDate, latitude, longitude) > 0){
                const hours = ("00" + newDate.getHours().toString()).slice(-2);
                const minutes = ("00" + newDate.getMinutes().toString()).slice(-2);
                result[1] = hours + ':' + minutes;
            }
            dateCounter = newDate;
        }
    }
    return result;
}

function findSunRisesSets(dateTimeString, latitude, longitude) {
    const currDate = convertToDate(dateTimeString);
    // First str time when rises second when sets
    let result = ['', ''];
    let SunHeightList = [toRadians(get_Moon_height(currDate, latitude, longitude))];
    let SunTimeList = [currDate.getTime()];

    for (let i = 1; i < 1440; i++){
        SunTimeList.push(SunTimeList[i-1] + (60 * 1000));
        SunHeightList.push(SunCalc.getPosition(new Date(SunTimeList[i]), latitude, longitude).altitude);

        if (SunHeightList[i - 1] < 0 && SunHeightList[i] > 0) {
            const date = new Date(SunTimeList[i]);
            const hours = ("00" + date.getHours().toString()).slice(-2);
            const minutes = ("00" + date.getMinutes().toString()).slice(-2);
            result[0] = hours + ':' + minutes;
        } else if (SunHeightList[i - 1] > 0 && SunHeightList[i] < 0) {
            const date = new Date(SunTimeList[i]);
            const hours = ("00" + date.getHours().toString()).slice(-2);
            const minutes = ("00" + date.getMinutes().toString()).slice(-2);
            result[1] = hours + ':' + minutes;
        }

    }
    return result;
}
