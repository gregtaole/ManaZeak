import binascii
import hashlib
import math
import os
import threading

from django.contrib.auth.decorators import login_required
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
from django.utils.html import strip_tags
from django.views.generic import TemplateView
from mutagen.id3 import ID3, ID3NoHeaderError
from mutagen.mp3 import MP3

from app.models import FileType, Track, Genre, Album, Artist


# Render class for serving modal to client (Scan)
class ScanModal(TemplateView):
    template_name = 'utils/modal/scanLibrary.html'

    @method_decorator(login_required(redirect_field_name='user/login.html', login_url='app:login'))
    def dispatch(self, *args, **kwargs):
        return super(ScanModal, self).dispatch(*args, **kwargs)


# Render class for serving modal to client (Edit metadata)
class EditMetadataModal(TemplateView):
    template_name = 'utils/modal/editMetadata.html'

    @method_decorator(login_required(redirect_field_name='user/login.html', login_url='app:login'))
    def dispatch(self, *args, **kwargs):
        return super(EditMetadataModal, self).dispatch(*args, **kwargs)


# Split a table in 4 table of equal size
def splitTable(table):
    if len(table) % 4 == 0:
        chunkSize = int(len(table) / 4)
    else:
        chunkSize = int(len(table) / 4) + 1
    for i in range(0, len(table), chunkSize):
        yield table[i:i + chunkSize]


# Check if an attribute is existing or not
def checkIfNotNone(trackAttribute):
    if trackAttribute is not None:
        return trackAttribute
    else:
        return "null"


# Check if an attribute is existing or not and add "" around it
def checkIfNotNoneNumber(trackAttribute):
    if trackAttribute is not None:
        return str(trackAttribute)
    else:
        return "\"null\""


# Return a bad format error
def badFormatError():
    data = {
        'RESULT': 'FAIL',
        'ERROR': 'Bad format'
    }
    return JsonResponse(data)


# Generate the base of any status message
def errorCheckMessage(isDone, error):
    errorTitle = ""
    errorMessage = ""
    if error == "badFormat":
        errorTitle = "Wrong format"
        errorMessage = "The server didn't understood what you said."
    elif error == "badRequest":
        errorTitle = "Bad request"
        errorMessage = "The server didn't expected this request."
    elif error == "dbError":
        errorTitle = "Database error"
        errorMessage = "Something went wrong with the database."
    elif error == "fileNotFound":
        errorTitle = "No such file"
        errorMessage = "The server didn't find the file you asked."
    elif error == "dirNotFound":
        errorTitle = "No such directory"
        errorMessage = "The server didn't find the directory you asked."
    elif error == "coverError":
        errorTitle = "Can't create file"
        errorMessage = "The server cannot generate the file for the covers, check the permissions."
    elif error is None:
        errorTitle = "null"
        errorMessage = "null"
    return {
        'DONE': isDone,
        'ERROR_H1': "\"" + errorTitle + "\"",
        'ERROR_MSG': "\"" + errorMessage + "\"",
    }


# Exporting a playlist to json with not all the file metadata
def exportPlaylistToSimpleJson(playlist):
    tracks = playlist.track.all()
    spiltedTracks = splitTable(tracks)
    threads = []
    finalData = "["
    for splitedTrack in spiltedTracks:
        threads.append(SimpleJsonCreator(splitedTrack))
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
        finalData += thread.finalData
    finalData = finalData[:-1]
    finalData += "]"
    return finalData.replace('\n', '').replace('\r', '')


# Thread for creating the json in parallel
class SimpleJsonCreator(threading.Thread):
    finalData = ""

    def __init__(self, tracks):
        threading.Thread.__init__(self)
        self.tracks = tracks

    def run(self):
        internData = ""
        for track in self.tracks:
            internData += "{\"ID\":"
            internData += str(track.id)
            internData += ",\"TITLE\":\""
            internData += checkIfNotNone(track.title)
            internData += "\",\"YEAR\":"
            internData += checkIfNotNoneNumber(track.year)
            internData += ",\"COMPOSER\":\""
            internData += checkIfNotNone(track.composer)
            internData += "\",\"PERFORMER\":\""
            internData += checkIfNotNone(track.performer)
            internData += "\",\"DURATION\":"
            internData += checkIfNotNoneNumber(track.duration)
            internData += ",\"BITRATE\":"
            internData += checkIfNotNoneNumber(track.bitRate)
            internData += ",\"ARTISTS\":["
            for artist in track.artist.all():
                internData += "{\"ID\":"
                internData += str(artist.id)
                internData += ",\"NAME\":\""
                internData += checkIfNotNone(artist.name)
                internData += "\"},"
            if len(track.artist.all()) != 0:
                internData = internData[:-1]
            internData += "],\"ALBUM\":{"
            if track.album is not None:
                internData += "\"ID\":"
                internData += checkIfNotNoneNumber(track.album.id)
                internData += ",\"TITLE\":\""
                internData += checkIfNotNone(track.album.title)
                internData += "\""
            internData += "},\"GENRE\":\""
            if track.genre is not None:
                internData += checkIfNotNone(track.genre.name)
            else:
                internData += "null"
            internData += "\"},"
        self.finalData = internData


# export a playlist to json, not threaded, to be avoided
def exportPlaylistToJson(playlist):
    tracks = playlist.track.all()
    finalData = "["
    for track in tracks:
        finalData += "{\"ID\":"
        finalData += str(track.id)
        finalData += ",\"TITLE\":\""
        finalData += checkIfNotNone(track.title)
        finalData += "\",\"YEAR\":"
        finalData += checkIfNotNoneNumber(track.year)
        finalData += ",\"COMPOSER\":\""
        finalData += checkIfNotNone(track.composer)
        finalData += "\",\"PERFORMER\":\""
        finalData += checkIfNotNone(track.performer)
        finalData += "\",\"TRACK_NUMBER\":"
        finalData += checkIfNotNoneNumber(track.number)
        finalData += ",\"BPM\":"
        finalData += checkIfNotNoneNumber(track.bpm)
        finalData += ",\"LYRICS\":\""
        finalData += checkIfNotNone(track.lyrics)
        finalData += "\",\"COMMENT\":\""
        finalData += checkIfNotNone(track.comment)
        finalData += "\",\"BITRATE\":"
        finalData += checkIfNotNoneNumber(track.bitRate)
        finalData += ",\"SAMPLERATE\":"
        finalData += checkIfNotNoneNumber(track.sampleRate)
        finalData += ",\"DURATION\":"
        finalData += checkIfNotNoneNumber(track.duration)
        finalData += ",\"GENRE\":\""
        if track.genre is not None:
            finalData += checkIfNotNone(track.genre.name)
        else:
            finalData += "null"
        finalData += "\",\"FILE_TYPE\":\""
        finalData += checkIfNotNone(track.fileType.name)
        finalData += "\",\"DISC_NUMBER\":"
        finalData += checkIfNotNoneNumber(track.discNumber)
        finalData += ",\"SIZE\":"
        finalData += checkIfNotNoneNumber(track.size)
        finalData += ",\"LAST_MODIFIED\":\""
        finalData += checkIfNotNoneNumber(track.lastModified)
        finalData += "\",\"ARTISTS\":["
        for artist in track.artist.all():
            finalData += "{\"ID\":"
            finalData += str(artist.id)
            finalData += ",\"NAME\":\""
            finalData += checkIfNotNone(artist.name)
            finalData += "\"},"
        finalData = finalData[:-1]
        finalData += "],\"ALBUM\":{"
        if track.album is not None:
            finalData += "\"ID\":"
            finalData += checkIfNotNoneNumber(track.album.id)
            finalData += ",\"TITLE\":\""
            finalData += checkIfNotNone(track.album.title)
            finalData += "\",\"TOTAL_DISC\":"
            finalData += checkIfNotNoneNumber(track.album.totalDisc)
            finalData += ",\"TOTAL_TRACK\":"
            finalData += checkIfNotNoneNumber(track.album.totalTrack)
            finalData += ",\"ARTIST\":["
            for artist in track.album.artist.all():
                finalData += "{\"ID\":"
                finalData += checkIfNotNoneNumber(artist.id)
                finalData += ",\"NAME\":\""
                finalData += checkIfNotNone(artist.name)
                finalData += "\"},"
            finalData = finalData[:-1]
            finalData += "]}},"
        else:
            finalData += "\"ID\":\"null\"}},"
    finalData = finalData[:-1]
    finalData += "]"
    return finalData


# Function to add all the genre, album and artist to the database
# Need to do this action before scan to avoid concurrency errors
def addAllGenreAndAlbumAndArtistsMP3(filePaths):
    for filePath in filePaths:
        try:
            audioTag = ID3(filePath)
        except ID3NoHeaderError:
            audioTag = ID3()
        # --- Adding genre to DB ---
        if 'TCON' in audioTag:
            genreName = strip_tags(audioTag['TCON'].text[0])
            if Genre.objects.filter(name=genreName).count() == 0:
                genre = Genre()
                genre.name = genreName
                genre.save()
        # --- Adding album to DB ---
        if 'TALB' in audioTag:
            albumTitle = strip_tags(audioTag['TALB'].text[0])
            if Album.objects.filter(title=albumTitle).count() == 0:  # If the album doesn't exist
                album = Album()
                album.title = albumTitle
                album.save()
        # --- Adding artist to DB ---
        if 'TPE1' in audioTag:  # Check if artist exists
            artists = strip_tags(audioTag['TPE1'].text[0]).split(",")
            for artistName in artists:
                artistName = artistName.lstrip()  # Remove useless spaces at the beginning
                if Artist.objects.filter(name=artistName).count() == 0:  # The artist doesn't exist
                    artist = Artist()
                    artist.name = artistName
                    artist.save()


# Create the file type entry
def populateDB():
    if FileType.objects.all().count() == 0:
        fileType = FileType(name="mp3")
        fileType.save()
        fileType = FileType(name="ogg")
        fileType.save()
        fileType = FileType(name="flac")
        fileType.save()
        fileType = FileType(name="wav")
        fileType.save()


# Create the CRC32 code from a file
def CRC32_from_file(filename):
    buf = open(filename, 'rb').read()
    buf = (binascii.crc32(buf) & 0xFFFFFFFF)
    return "%08X" % buf


# Compare the file by hash (faster than reading the tag)
def compareTrackAndFile(track, root, file, playlist, convert, fileTypeId, replacedTitles):
    fileCRC = CRC32_from_file(root + "/" + file)
    if fileCRC != track.CRC:
        replacedTitles.append(track.title)
        track.delete()
        addTrackMP3(root, file, playlist, convert, fileTypeId)
    else:
        track.scanned = True


# Check if new file have been added
def rescanLibrary(library):
    playlist = library.playlist
    convert = False
    mp3ID = FileType.objects.get(name="mp3")
    replacedTitles = []
    for root, dirs, files in os.walk(library.path):
        for file in files:
            if file.lower().endswith('.mp3'):
                track = Track.objects.get(location=root + file)
                if track is None:
                    addTrackMP3(root, file, playlist, convert, mp3ID)
                else:
                    compareTrackAndFile(track, root, file, playlist, convert, mp3ID, replacedTitles)
    # Removed the tracks that haven't been scanned
    removedTracks = playlist.track.filter(scanned=False).delete()
    return [replacedTitles, removedTracks]


# Scan all the attributes of an MP3 track, and add it to base.
def addTrackMP3(root, file, playlist, convert, fileTypeId, coverPath):
    track = Track()

    # --- Calculating checksum
    track.CRC = CRC32_from_file(root + "/" + file)

    # --- FILE INFORMATION ---
    audioFile = MP3(root + "/" + file)
    track.location = root + "/" + file
    track.size = os.path.getsize(root + "/" + file)
    track.bitRate = audioFile.info.bitrate
    track.duration = audioFile.info.length
    track.sampleRate = audioFile.info.sample_rate
    track.bitRateMode = audioFile.info.bitrate_mode
    track.fileType = fileTypeId

    # --- FILE TAG ---
    audioTag = ID3(root + "/" + file)
    if convert:
        audioTag.update_to_v24()
        audioTag.save()
    audioTag = ID3(root + "/" + file)

    # --- COVER ---
    if 'APIC:' in audioTag:
        front = audioTag['APIC:'].data
        # Creating md5 hash for the cover
        md5Name = hashlib.md5()
        md5Name.update(front)
        # Check if the cover already exists and save it
        if not os.path.isfile(coverPath + md5Name.hexdigest() + ".jpg"):
            with open(coverPath + md5Name.hexdigest() + ".jpg", 'wb') as img:
                img.write(front)
        track.coverLocation = md5Name.hexdigest() + ".jpg"
    if 'TIT2' in audioTag:
        if not audioTag['TIT2'].text[0] == "":
            track.title = strip_tags(audioTag['TIT2'].text[0])

    if 'TDRC' in audioTag:
        if not audioTag['TDRC'].text[0].get_text() == "":
            track.year = strip_tags(audioTag['TDRC'].text[0].get_text()[:4])  # Date of Recording

    totalTrack = 0
    totalDisc = 1
    if 'TRCK' in audioTag:
        if not audioTag['TRCK'].text[0] == "":
            if "/" in audioTag['TRCK'].text[0]:  # Contains info about the album number of track
                tags = strip_tags(audioTag['TRCK'].text[0]).split('/')
                track.number = tags[0]
                totalTrack = tags[1]
            else:
                track.number = strip_tags(audioTag['TRCK'].text[0])

    if 'TCOM' in audioTag:
        if not audioTag['TCOM'].text[0] == "":
            track.composer = strip_tags(audioTag['TCOM'].text[0])

    if 'TOPE' in audioTag:
        if not audioTag['TOPE'].text[0] == "":
            track.performer = strip_tags(audioTag['TOPE'].text[0])

    if 'TBPM' in audioTag:
        if not audioTag['TBPM'].text[0] == "":
            track.bpm = math.floor(float(strip_tags(audioTag['TBPM'].text[0])))

    if 'COMM' in audioTag:
        if not audioTag['COMM'].text[0] == "":
            track.comment = strip_tags(audioTag['COMM'].text[0])

    if 'USLT' in audioTag:
        if not audioTag['USLT'].text[0] == "":
            track.lyrics = strip_tags(audioTag['USLT'].text[0])

    if len(audioTag.getall('TXXX')) != 0:
        for txxx in audioTag.getall('TXXX'):
            if txxx.desc == 'TOTALDISCS':
                totalDisc = strip_tags(txxx.text[0])

    # --- Save data for many-to-many relationship registering ---
    track.save()

    # --- Adding genre to DB ---
    if 'TCON' in audioTag:
        genreName = strip_tags(audioTag['TCON'].text[0])
        genreFound = Genre.objects.filter(name=genreName)
        if genreFound.count() == 0:
            genre = Genre()
            genre.name = genreName
            genre.save()
        genre = Genre.objects.get(name=genreName)
        track.genre = genre

    # --- Adding artist to DB ---
    if 'TPE1' in audioTag:  # Check if artist exists
        artists = strip_tags(audioTag['TPE1'].text[0]).split(",")
        for artistName in artists:
            artistName = artistName.lstrip()  # Remove useless spaces at the beginning
            num_results = Artist.objects.filter(name=artistName).count()
            if num_results == 0:  # The artist doesn't exist
                artist = Artist()
                artist.name = artistName
                artist.save()
            artist = Artist.objects.get(name=artistName)
            track.artist.add(artist)

    # --- Adding album to DB ---
    if 'TALB' in audioTag:
        albumTitle = strip_tags(audioTag['TALB'].text[0])
        if Album.objects.filter(title=albumTitle).count() == 0:  # If the album doesn't exist
            album = Album()
            album.title = albumTitle
            album.totalTrack = totalTrack
            album.totalDisc = totalDisc
            album.save()
            for trackArtist in track.artist.all():
                album.artist.add(trackArtist)
        album = Album.objects.get(title=albumTitle)
        # Check for each artist if he exists in the album
        for trackArtist in track.artist.all():
            if album.artist.filter(name=trackArtist.name).count() == 0:  # The Artist wasn't added
                album.artist.add(trackArtist)
                album.save()
        track.album = album
        track.save()

    # --- Adding track to playlist --- #
    playlist.track.add(track)


# Adding a MP3 track to the database
def addTrackMP3Thread(path, playlist, convert, fileTypeId, coverPath):
    track = Track()

    # --- FILE INFORMATION ---
    audioFile = MP3(path)
    track.location = path
    track.size = os.path.getsize(path)
    track.bitRate = audioFile.info.bitrate
    track.duration = audioFile.info.length
    track.sampleRate = audioFile.info.sample_rate
    track.bitRateMode = audioFile.info.bitrate_mode
    track.fileType = fileTypeId

    # --- FILE TAG ---
    try:
        audioTag = ID3(path)
        if convert:
            audioTag.update_to_v24()
            audioTag.save()
        audioTag = ID3(path)
    except ID3NoHeaderError:
        audioTag = ID3()

    # --- COVER ---
    if 'APIC:' in audioTag:
        front = audioTag['APIC:'].data
        # Creating md5 hash for the cover
        md5Name = hashlib.md5()
        md5Name.update(front)
        # Check if the cover already exists and save it
        if not os.path.isfile(coverPath + md5Name.hexdigest() + ".jpg"):
            with open(coverPath + md5Name.hexdigest() + ".jpg", 'wb') as img:
                img.write(front)
        track.coverLocation = "../static/img/covers/" + md5Name.hexdigest() + ".jpg"
    if 'TIT2' in audioTag:
        if not audioTag['TIT2'].text[0] == "":
            track.title = strip_tags(audioTag['TIT2'].text[0])

    if 'TDRC' in audioTag:
        if not audioTag['TDRC'].text[0].get_text() == "":
            track.year = strip_tags(audioTag['TDRC'].text[0].get_text())[:4]  # Date of Recording

    totalTrack = 0
    totalDisc = 1
    if 'TRCK' in audioTag:
        if not audioTag['TRCK'].text[0] == "":
            if "/" in audioTag['TRCK'].text[0]:  # Contains info about the album number of track
                tags = strip_tags(audioTag['TRCK'].text[0]).split('/')
                track.number = tags[0]
                totalTrack = tags[1]
            else:
                track.number = strip_tags(audioTag['TRCK'].text[0])

    if 'TCOM' in audioTag:
        if not audioTag['TCOM'].text[0] == "":
            track.composer = strip_tags(audioTag['TCOM'].text[0])

    if 'TOPE' in audioTag:
        if not audioTag['TOPE'].text[0] == "":
            track.performer = strip_tags(audioTag['TOPE'].text[0])

    if 'TBPM' in audioTag:
        if not audioTag['TBPM'].text[0] == "":
            track.bpm = math.floor(float(strip_tags(audioTag['TBPM'].text[0])))

    if 'COMM' in audioTag:
        if not audioTag['COMM'].text[0] == "":
            track.comment = strip_tags(audioTag['COMM'].text[0])

    if 'USLT' in audioTag:
        if not audioTag['USLT'].text[0] == "":
            track.lyrics = strip_tags(audioTag['USLT'].text[0])

    if len(audioTag.getall('TXXX')) != 0:
        for txxx in audioTag.getall('TXXX'):
            if txxx.desc == 'TOTALDISCS':
                totalDisc = strip_tags(txxx.text[0])

    # --- Save data for many-to-many relationship registering ---
    track.save()

    # --- Adding genre to DB ---
    if 'TCON' in audioTag:
        genreName = strip_tags(audioTag['TCON'].text[0])
        if Genre.objects.filter(name=genreName).count() == 1:
            genre = Genre.objects.get(name=genreName)
            track.genre = genre

    # --- Adding artist to DB ---
    if 'TPE1' in audioTag:  # Check if artist exists
        artists = strip_tags(audioTag['TPE1'].text[0]).split(",")
        for artistName in artists:
            artistName = artistName.lstrip()  # Remove useless spaces at the beginning
            num_results = Artist.objects.filter(name=artistName).count()
            if num_results == 0:  # The artist doesn't exist
                artist = Artist()
                artist.name = artistName
                artist.save()
            artist = Artist.objects.get(name=artistName)
            track.artist.add(artist)
    else:
        # TODO default value of artist (see if it's possible)
        pass

    # --- Adding album to DB ---
    if 'TALB' in audioTag:
        albumTitle = strip_tags(audioTag['TALB'].text[0])
        if Album.objects.filter(title=albumTitle).count() == 0:  # If the album doesn't exist
            album = Album()
            album.title = albumTitle
            album.totalTrack = totalTrack
            album.totalDisc = totalDisc
            album.save()
            for trackArtist in track.artist.all():
                album.artist.add(trackArtist)
        album = Album.objects.get(title=albumTitle)
        # Check for each artist if he exists in the album
        for trackArtist in track.artist.all():
            if album.artist.filter(name=trackArtist.name).count() == 0:  # The Artist wasn't added
                album.artist.add(trackArtist)
                album.save()
        track.album = album
        track.save()

    else:
        # TODO default value of artist (see if it's possible)
        pass

    # --- Adding track to playlist --- #
    playlist.track.add(track)


# Thread for generating multiple CRC32
class CRCGenerator(threading.Thread):
    def __init__(self, tracks):
        threading.Thread.__init__(self)
        self.tracks = tracks

    def run(self):
        tracks = list(self.tracks)
        print(tracks)
        for track in tracks:
            buf = open(track.location, 'rb').read()
            buf = (binascii.crc32(buf) & 0xFFFFFFFF)
            track.CRC = "%08X" % buf
            print("CRC = " + track.CRC)
            track.save()


# Import in a threaded way a library
class ImportMp3Thread(threading.Thread):
    def __init__(self, mp3Paths, playlist, convert, fileTypeId, coverPath):
        threading.Thread.__init__(self)
        self.mp3Paths = mp3Paths
        self.playlist = playlist
        self.convert = convert
        self.fileTypeId = fileTypeId
        self.coverPath = coverPath

    def run(self):
        for path in self.mp3Paths:
            addTrackMP3Thread(path, self.playlist, self.convert, self.fileTypeId, self.coverPath)


# Scan a library.
def scanLibraryProcess(mp3Files, library, playlist, convert, coverPath, mp3ID):
    print("process")
    addAllGenreAndAlbumAndArtistsMP3(mp3Files)
    print("Added DB structure")
    print(len(mp3Files))
    trackPath = splitTable(mp3Files)
    threads = []
    # saving all the library to base
    for tracks in trackPath:
        threads.append(ImportMp3Thread(tracks, playlist, convert, mp3ID, coverPath))
    for thread in threads:
        thread.start()
    print("launched scanning threads")
    for thread in threads:
        thread.join()
    print("ended scanning")
    playlist.isScanned = True
    playlist.save()
    library.playlist = playlist
    library.save()
    # TODO : re-enable CRC generation
    # tracks = playlist.track.all()
    # splicedTracks = splitTable(tracks)
    # threads = []
    # generating CRC checksum
    # for tracks in splicedTracks:
    #    threads.append(CRCGenerator(tracks))
    # for thread in threads:
    #    thread.start()
