function updateTime() {
    var now = new Date();
    var currentTime = new Date().toLocaleString("en-NZ", { hour12: false });
    var timeText = document.querySelector("#timeElement");
    if (timeText) {
        timeText.innerHTML = currentTime;
    }
    var appClockDisplay = document.querySelector("#appClockDisplay");
    if (appClockDisplay) {
        appClockDisplay.innerHTML = now.toLocaleTimeString("en-NZ", { hour12: false });
    }
    drawAnalogueClock();
}
setInterval(updateTime, 1000);


var selectedIcon = undefined;
var highestZIndex = 10;


var appRegistry = [
    { window: document.querySelector("#welcome"), iconId: "#welcomeopen" },
    { window: document.querySelector("#notes"), iconId: "#notesopen" },
    { window: document.querySelector("#game_corner"), iconId: "#game_corneropen"},
    { window: document.querySelector("#clock"), iconId: "#clockopen" }
];


function drawAnalogueClock() {
    var canvas = document.querySelector("#analogueClock");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var radius = canvas.height / 2;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius, radius);
    radius = radius * 0.90;
    
    // Draw the clock face background & center dot
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.07, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Calculate time for hands
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    // Hour hand
    hour = hour % 12;
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (3600 * 60));
    drawHand(ctx, hour, radius * 0.5, 6, '#333');

    // Minute hand
    minute = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minute, radius * 0.75, 4, '#555');

    // Second hand
    second = (second * Math.PI / 30);
    drawHand(ctx, second, radius * 0.85, 2, 'red');

    ctx.restore();
}


function drawHand(ctx, pos, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}


function selectIcon(element) {
    if (element) {
        element.classList.add("selected");
        selectedIcon = element;
    }
}


function deselectIcon(element) {
    if (element) {
        element.classList.remove("selected");
        if (selectedIcon === element) {
            selectedIcon = undefined;
        }
    }
}


function focusWindow(windowElement) {
    if (!windowElement) return;

    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;

    // Remove active class from all windows, add to this one
    appRegistry.forEach(app => {
        if (app.window) {
            app.window.classList.remove("active-window");
        }
    });
    windowElement.classList.add("active-window");
}


function closeWindow(windowElement, iconId) {
    if (windowElement) {
        windowElement.style.display = "none";
        windowElement.classList.remove("active-window");
    }
    
    if (iconId) {
        var iconElement = document.querySelector(iconId);
        if (iconElement) {
            deselectIcon(iconElement);
        }
    }

    // Find remaining open windows and focus the top one
    var remainingOpenWindows = appRegistry.filter(app => {
        return app.window && app.window.style.display !== "none";
    });

    if (remainingOpenWindows.length > 0) {
        remainingOpenWindows.sort((a, b) => {
            return parseInt(window.getComputedStyle(b.window).zIndex || 0) - parseInt(window.getComputedStyle(a.window).zIndex || 0);
        });

        var topWindow = remainingOpenWindows[0];
        focusWindow(topWindow.window);
        
        var topIcon = document.querySelector(topWindow.iconId);
        if (topIcon) {
            if (selectedIcon) deselectIcon(selectedIcon);
            selectIcon(topIcon);
        }
    } else {
        if (selectedIcon) {
            deselectIcon(selectedIcon);
        }
    }
}


function openWindow(windowElement, iconId) {
    if (windowElement) {
        windowElement.style.display = "";
        focusWindow(windowElement);
    }
    if (iconId) {
        var iconElement = document.querySelector(iconId);
        if (iconElement) {
            if (selectedIcon && selectedIcon !== iconElement) {
                deselectIcon(selectedIcon);
            }
            selectIcon(iconElement);
        }
    }
}


var welcomeScreen = document.querySelector("#welcome");
var welcomeScreenClose = document.querySelector("#welcomeclose");
var welcomeScreenOpen = document.querySelector("#welcomeopen");

var notesScreen = document.querySelector("#notes");
var notesScreenClose = document.querySelector("#notesclose");
var notesScreenOpen = document.querySelector("#notesopen");

var clockScreen = document.querySelector("#clock");
var clockScreenClose = document.querySelector("#clockclose");
var clockScreenOpen = document.querySelector("#clockopen");

var game_cornerScreen = document.querySelector("#game_corner");
var game_cornerScreenClose = document.querySelector("#game_cornerclose");
var game_cornerScreenOpen = document.querySelector("#game_corneropen");


if (welcomeScreenClose && welcomeScreenOpen) {
    welcomeScreenClose.addEventListener("click", () => closeWindow(welcomeScreen, "#welcomeopen"));
    welcomeScreenOpen.addEventListener("click", () => openWindow(welcomeScreen, "#welcomeopen"));
}


if (notesScreenClose && notesScreenOpen) {
    notesScreenClose.addEventListener("click", () => closeWindow(notesScreen, "#notesopen"));
    notesScreenOpen.addEventListener("click", () => openWindow(notesScreen, "#notesopen"));
}


if (clockScreenClose && clockScreenOpen) {
    clockScreenClose.addEventListener("click", () => closeWindow(clockScreen, "#clockopen"));
    clockScreenOpen.addEventListener("click", () => openWindow(clockScreen, "#clockopen"));
}

if (game_cornerScreenClose && game_cornerScreenOpen) {
    game_cornerScreenClose.addEventListener("click", () => closeWindow(game_cornerScreen, "#game_corneropen"));
    game_cornerScreenOpen.addEventListener("click", () => openWindow(game_cornerScreen, "#game_corneropen"));
}



appRegistry.forEach(app => {
    if (app.window) {
        app.window.addEventListener("mousedown", () => {
            focusWindow(app.window);
            var iconElement = document.querySelector(app.iconId);
            if (iconElement && selectedIcon !== iconElement) {
                if (selectedIcon) deselectIcon(selectedIcon);
                selectIcon(iconElement);
            }
        });
    }
});


function checkInitialWindowState(windowElement, iconId) {
    if (windowElement) {
        var computedDisplay = window.getComputedStyle(windowElement).display;
        if (computedDisplay !== "none") {
            focusWindow(windowElement);
            var iconElement = document.querySelector(iconId);
            if (iconElement) {
                selectIcon(iconElement);
            }
        }
    }
}


checkInitialWindowState(welcomeScreen, "#welcomeopen");
checkInitialWindowState(notesScreen, "#notesopen");
checkInitialWindowState(clockScreen, "#clockopen");
checkInitialWindowState(game_cornerScreen, "#game_corneropen");


dragElement(document.querySelector("#notes"));
dragElement(document.querySelector("#welcome"));
dragElement(document.querySelector("#clock"));
dragElement(document.querySelector("#game_corner"));


function dragElement(element) {
    var initialX = 0;
    var initialY = 0;
    var currentX = 0;
    var currentY = 0;

    var header = document.getElementById(element.id + "header");
    if (header) {
        header.onmousedown = startDragging;
    } else {
        element.onmousedown = startDragging;
    }

    function startDragging(e) {
        e = e || window.event;
        e.preventDefault();
        focusWindow(element);
        initialX = e.clientX;
        initialY = e.clientY;
        document.onmouseup = stopDragging;
        document.onmousemove = elementDrag; 
    }

    function elementDrag(e) { 
        e = e || window.event;
        e.preventDefault();
        currentX = initialX - e.clientX;
        currentY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;
        element.style.top = (element.offsetTop - currentY) + "px";
        element.style.left = (element.offsetLeft - currentX) + "px";
    }

    function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

