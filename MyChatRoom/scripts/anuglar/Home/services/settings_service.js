angular.module("MyChatRoom.services").service("settingsService", function () {
    var settingsService = {};
    settingsService.initialize = function () {
        var localStorageSettings = localStorage.getItem("settings");
        if (localStorageSettings) {
            localStorageSettings = JSON.parse(localStorageSettings);
            settingsService.sound.active = localStorageSettings.sound_active;
            settingsService.sound.volume = localStorageSettings.sound_volume;
            settingsService.sound.selected_id = localStorageSettings.sound_selected_id;

            settingsService.alerts = localStorageSettings.alerts;
        }
        settingsService.sound.audio.defaultPlaybackRate = 3;
        settingsService.setVoluemValue();
        settingsService.setSrcValue();

        settingsService.sound.audio.addEventListener('loadedmetadata', function () {
            console.log("Playing " + settingsService.sound.audio.src + ", for: " + settingsService.sound.audio.duration + "seconds.");
            if (settingsService.sound.audio.duration < 1) {
                settingsService.sound.audio.defaultPlaybackRate = 2;
            } else {
                settingsService.sound.audio.defaultPlaybackRate = 3;
            }
            console.log("settingsService.sound.audio.defaultPlaybackRate:" , settingsService.sound.audio.defaultPlaybackRate)
        });
    }

    settingsService.sound = {
        active: true,
        volume : 10,
        sources: [
            {id:1, name: "apple", src: "../../../sounds/message/apple.mp3" },
            {id:2, name: "Power up", src: "../../../sounds/message/Power up.mp3" },
            {id:3, name: "Stunned", src: "../../../sounds/message/Stunned.mp3" },
            {id:4, name: "Swim", src: "../../../sounds/message/Swin.mp3" },
            {id:5, name: "Swish", src: "../../../sounds/message/swish.mp3" },
            {id:6, name: "Throw", src: "../../../sounds/message/Throw.mp3" },
            {id:7, name: "Woo hoo", src: "../../../sounds/message/Woohoo.mp3" }
        ],
        selected_id: 1,
        audio: new Audio("../../../sounds/message/apple.mp3")
    }

    settingsService.alerts = true;
    
    settingsService.messageSoundPlay = function () {
        if (settingsService.sound.audio.paused) {
            settingsService.sound.audio.play();
        } else {
            settingsService.sound.audio.currentTime = 0;
        }
    };

    settingsService.setVoluemValue = function () {
        settingsService.sound.audio.volume = settingsService.sound.active ? settingsService.sound.volume / 10 : 0;
    };

    settingsService.setSrcValue = function () {
        var selected_src = _.find(settingsService.sound.sources, { id: settingsService.sound.selected_id }).src;
        var current_src = settingsService.sound.audio.src;
        settingsService.sound.audio.src = selected_src;
    };

    settingsService.onChageSettings = function () {
        localStorage.setItem("settings", JSON.stringify({
            sound_active: settingsService.sound.active,
            sound_volume: settingsService.sound.volume,
            sound_selected_id: settingsService.sound.selected_id,
            alerts: settingsService.alerts
        }));
    };

    $("#settings-trigger").click(function () {
        settingsService.action = true;
    });

    settingsService.initialize();

    return settingsService;

});