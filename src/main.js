const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 700,
    });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true,
        })
    );

    win.on('closed', () => {
        win = null;
    });

    win.webContents.executeJavaScript(`
        function calculatePhase(dateTimeString) {
            const [year, month, day, hour, minute] = dateTimeString.split(/-|T|:/);
        
            const entry_point = new Date(2023, 3, 21, 19, 27);
            const curr_time = new Date(year, month, day, hour, minute);
            const delta = Math.abs(curr_time.getTime() - entry_point.getTime()) / (1000*60);
            const interval_in_minutes = 42524 / 239;
            const how_many_intervals = Math.floor(delta / interval_in_minutes);
            return how_many_intervals % 239;
        }
        
        function drawPhase(){
            const container = document.getElementById('Moon_photo_phase');
        
            if (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        
            // Створити елемент зображення
            const img = document.createElement('img');
        
            const myInput = document.getElementById('moon_time');
            let current_phase = calculatePhase(myInput.value.toString());
            if (current_phase < 100) {
                current_phase =  ("000" + current_phase.toString()).slice(-3);
            } else {
                current_phase = current_phase.toString();
            }
            // Встановити атрибут src для зображення
            img.src = 'img/All_cycle/All_cycle_'+current_phase+'.jpg';
        
            // Встановити висоту зображення в 90% від батьківського розміру
            img.style.height = '95%';
            img.style.display = 'block';
            img.style.margin = 'auto';
        
            // Вставити зображення в контейнер
            container.appendChild(img);
        }
        
        function drawMoon(y, margin){
            const DateVal = document.getElementById('moon_time').value.toString();
            const canvas = document.getElementById('myCanvas');
            const ctx = canvas.getContext('2d');
            
            const image = new Image();
            image.src = 'img/Moons2/Moon_5.png';
            // Очікування завантаження зображення
            image.onload = function() {
                // Малювання зображення на canvas
                ctx.drawImage(image, margin-12, y + margin - 20, 25, 25);
            };
        }
        
        function draw() {
            const DateVal = document.getElementById('moon_time').value.toString();
            const canvas = document.getElementById('myCanvas');
            const ctx = canvas.getContext('2d');
            const lon = document.getElementById('Longitude').value.toString();
            const lat = document.getElementById('Latitude').value.toString();
    
            // Встановлення відступів
            const margin = 20;
            const graphWidth = canvas.width - 2 * margin;
            const graphHeight = canvas.height - 2 * margin;
    
            // Масиви зі значеннями x і y
            const data = when_sets_rises(DateVal, lon, lat);
            const x = getGraphXCoordinates(data[0], graphWidth);
            const y = getGraphYCoordinates(data[1], graphHeight);
            const y_0 = getXAxis(data[1], y) + margin;
        
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#19193B';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.beginPath();
            ctx.moveTo(x[0] + margin, y[0] + margin);
            for (let i = 1; i < x.length; i++) {
                ctx.lineTo(x[i] + margin, y[i] + margin);
            }
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Малювання вісі оХ
            ctx.beginPath();
            ctx.moveTo(margin, y_0);
            ctx.lineTo(canvas.width - margin, y_0);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();

            drawMoon(y[1], margin)
            

            //Щоб під горизонтом все було частково затемненим
            ctx.fillStyle = 'rgba(25, 25, 59, 0.6)';
            ctx.fillRect(0, y_0, canvas.width, canvas.height-y_0);

            // Права частина горизонту
            const horizon_right = new Image();
            horizon_right.src = 'img/Horizons/Horizon_right.png';
            // Очікування завантаження зображення
            horizon_right.onload = function() {
                // Малювання зображення на canvas
                ctx.drawImage(horizon_right, canvas.width-154, y_0-50);
            };

            // Ліва частина горизонту
            const horizon_left = new Image();
            horizon_left.src = 'img/Horizons/Horizon_left.png';
            // Очікування завантаження зображення
            horizon_left.onload = function() {
                // Малювання зображення на canvas
                ctx.drawImage(horizon_left, 0, y_0-50);
            };

            // Центральна частина горизонту
            const horizon_center = new Image();
            horizon_center.src = 'img/Horizons/Horizon_center.png';
            // Очікування завантаження зображення
            horizon_center.onload = function() {
                // Малювання зображення на canvas
                ctx.drawImage(horizon_center, 154, y_0-50);
            };
        }
        
        function drawText() {
            const DateVal = document.getElementById('moon_time').value.toString();
            const lon = document.getElementById('Longitude').value.toString();
            const lat = document.getElementById('Latitude').value.toString();
            
            const MoonText = findMoonRisesSets(DateVal, lat, lon)
            const SunText = findSunRisesSets(DateVal, lat, lon)
    
            const MoonTimeRise = document.getElementById('MoonTimeRise');
            const MoonTimeSet = document.getElementById('MoonTimeSet');
            const SunTimeRise = document.getElementById('SunTimeRise');
            const SunTimeSet = document.getElementById('SunTimeSet');
            MoonTimeRise.innerText = "rises: " + MoonText[0];
            MoonTimeSet.innerText = "sets: " + MoonText[1];
            SunTimeRise.innerText = "rises: " + SunText[0];
            SunTimeSet.innerText = "sets: " + SunText[1];
        }
        
        const myInput = document.getElementById('moon_time');
        myInput.addEventListener('input', () => {
            drawPhase();
            drawText();
            draw();
        });
        
        const lon = document.getElementById('Longitude');
        lon.addEventListener('input', () => {
            drawPhase();
            drawText();
            draw();
        });
        
        const lat = document.getElementById('Latitude');
        lat.addEventListener('input', () => {
            drawPhase();
            drawText();
            draw();
        });
        
        drawPhase();
        drawText();
        draw();
    `);
}



app.on('ready', createWindow);
app.on('window-all-closed', () => {
    app.quit();
});
