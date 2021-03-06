# ManaZeak
ManaZeak is a free software that gives you the ability to listen to and edit your musical library from anywhere that has a connection and a true web browser (i.e. Chromium, Firefox). It is also linked to [SyncThing](https://syncthing.net/), to automatically sync your online library with all the devices that share it. 

# Get Started
In order to make an instance work, run the following commands :
- $ ```git clone https://github.com/Squadella/ManaZeak```
- $ ```cp docker-compose.yml.example docker-compose.yml```

Replace all ```/PATH/TO/LIBRARY``` in ```docker-compose.yml``` by the path of your music files, then keep going with :

- $ ```docker-compose build``` (This may take a while, go grab some coffee...)
- $ ```docker-compose up -d```

You can now check that all containers have been launched correctly by using :
- $ ```docker ps -a```

Finally, if everything is OK with Docker, grab a browser and go to [127.0.0.1/app](127.0.0.1/app)

# Features
- Basic player
    - Play/Pause/Stop
    - Volume
- Basic playlist
    - Repeat (off, one, album, artist)
    - Random, Shuffle
- Queue system
- ListView
- Track preview and track information
- Single track download
- [MoodBar](https://en.wikipedia.org/wiki/Moodbar)
- User account system
- User stats
- Track suggestion

# Scheduled
- Specific AlbumView
- Specific GenreView
- SyncThing link
- Playlist creation
- Tracks/album download
- Track adding via Drag & Drop

# Technologies
- Django
- Postgresql
- SyncThing
- Docker
- d3.js (for [MoodBars](https://en.wikipedia.org/wiki/Moodbar))

# Contributors
- [Arthur Beaulieu](https://github.com/ArthurBeaulieu)
- [Pierre Bouniol](https://github.com/Squadella)
- [Valentin Peiro](https://github.com/Oxydiz)
- [Pierre-Balthazar Donadieu de Lavit](https://github.com/Belash)
- [Armand Vignat](https://github.com/avignat)
- [Guilhem Piat](https://github.com/Syncrossus)

# Contribution

Any contribution, of any type is welcome! If you want to make a suggestion, feel free to do so! Furthermore, if you want to add pieces of code, please use the following conventions :

Nota Bene : All variables and functions must be [lowerCamelCase](https://en.wiktionary.org/wiki/CamelCase). Every block is indented of 4 spaces. Function, and more generally variables must be alphabetically sorted (in all kind of files). Finally, if there is several variable attribution at once, align the '=' of ':' sign with the longest variable.

## - Js :

```
/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *  MyClas class                                   *
 *                                                 *
 *  Class descripton                               *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */

// Class constant var

class MyClass {
    constructor() {

        // Your constructor instructions
    }

//  --------------------------------  PUBLIC METHODS  ---------------------------------  //

    /**
     * method : myPublicFunction (public)
     * class  : MyClass
     * desc   : myPublicFunction description
     * arg    : {type} arg - A function argument
     * return : {type} the returned value
     **/
    myPublicFunction(arg) {
        // Your code here
        return true
    }

//  --------------------------------  PRIVATE METHODS  --------------------------------  //

    /**
     * method : _myPrivateFunction (private)
     * class  : MyClass
     * desc   : _myPrivateFunction description
     * arg    : {type} arg - A function argument
     **/
    _myPrivateFunction(arg) {

    }

//  ------------------------------  GETTERS / SETTERS  --------------------------------  //

    getMyVar()      { return this.myVar;  }

    setMyVar(myVar) { this.myVar = myVar; }

};

```

## - SCSS

```
$myLocalVar: 0;

#levelOne {

    position: absolute;

    .insideJob {
        margin: $myLocalVar;
    }

    div {
        padding: 0;

        #levelThree {
            display: inline-block;
            z-index: 999;
        }
    }
}

```
