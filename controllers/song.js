'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;

    Song.findById(songId).populate({ path: 'album' }).exec((err, song) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servicio' });
        } else {
            if (!song) {
                res.status(404).send({ message: 'La cación no existe' });
            } else {
                res.status(200).send({ song });
            }
        }
    });


}

function saveSong(req, res) {
    var song = new Song();

    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songStored) {
                res.status(404).send({ message: 'No se guardo la canción' });
            } else {
                res.status(200).send({ song: songStored });
            }
        }
    });
}

function getSongs(req, res) {
    var albumId = req.params.id;

    if (!albumId) {
        var find = Song.find({}).sort('number');
    } else {
        var find = Song.find({ album: albumId }).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function (err, songs) {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });

        } else {
            if (!songs) {
                res.status(404).send({ message: 'No hay canciones' });
            } else {
                res.status(200).send({ songs });
            }
        }
    });
}

function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdate) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songUpdate) {
                res.status(404).send({ message: 'No se actualizo la canción' });
            } else {
                res.status(200).send({ song: songUpdate });
            }
        }
    });
}


function deleteSong(req, res) {
    var songId = req.params.id;
    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songRemoved) {
                res.status(404).send({ message: 'No se ha eliminado la canción' });
            } else {
                res.status(200).send({ song: songRemoved });
            }
        }
    });
}

function uploadFile(req, res){
    var songId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.file.path;
        // A continuacion se consigue solo el nombre de la imagen
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'mp3' || 'ogg') {
   
            Song.findByIdAndUpdate(songId, { file: file_name }, (err, songUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar la canción' });
                } else {
                    if (!songUpdated) {
                     
                        res.status(404).send({ message: 'No se pudo actualizar la canción' });
                    } else {
                       
                        res.status(200).send({ song: songUpdated });
                    }
                }
            });
        } else {
            res.status(500).send({ message: 'Extensión del archivo no valida' });
        }

    } else {
        res.status(404).send({ message: 'No ha subido ningun audio' });
    }

}

function getSongFile(req,res){
    var audioFile = req.params.songFile;
    var path_file = './upload/songs/'+audioFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({ message: 'No existe la canción...' });
        }
    });
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile

}