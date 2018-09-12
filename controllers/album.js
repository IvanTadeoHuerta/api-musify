'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({ path: 'artist' }).exec((err, album) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!album) {
                res.status(404).send({ message: 'El album no existe' })
            } else {
                res.status(200).send({ album });
            }
        }
    });
}

function saveAlbum(req, res) {
    var album = new Album();

    var params = req.body;
    album.titulo = params.titulo;
    album.description = params.description;
    album.year = params.year;
    album.image = null;
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {

            if (!albumStored) {
                res.status(404).send({ message: 'No se guardo el album' });
            } else {
                res.status(200).send({ album: albumStored });
            }
        }
    });
}

function getAlbums(req, res) {
    var artisId = req.params.artist;

    if (!artisId) {
        //Si no viene el artista, sacar todos los albums
        var find = Album.find({}).sort('titulo');
    } else {
        // Obten album de artista 
        var find = Album.find({ artist: artisId }).sort('year');
    }

    find.populate({ path: 'artist' }).exec((err, albums) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!albums) {
                res.status(404).send({ message: 'No hay albums' });
            } else {
                res.status(200).send({ albums });
            }
        }
    });
}


function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (error, albumUpdate) => {
        if (error) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!albumUpdate) {
                res.status(404).send({ message: 'No se actualizo album' });
            } else {
                res.status(200).send({ album: albumUpdate });
            }
        }
    });
}

function deleteAlbum(req, res) {
    var albumId = req.params.id;

    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if (err) {
            res.status(500).send({ message: "Error al eliminar album" });
        } else {

            if (!albumRemoved) {
                res.status(404).send({ message: "Album no eliminado" });
            } else {
                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        res.status(500).send({ message: "Error al eliminar cancion" });
                    } else {
                        if (!songRemoved) {
                            res.status(404).send({ message: "Cancion no eliminada" });
                        } else {
                            res.status(200).send({ albumRemoved });
                        }
                    }
                });
            }

        }
    });
}


function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        // A continuacion se consigue solo el nombre de la imagen
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || 'jpg' || 'gif') {
   
            Album.findByIdAndUpdate(albumId, { image: file_name }, (err, albumUpdate) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar imagen del album' });
                } else {
                    if (!albumUpdate) {
                        res.status(404).send({ message: 'No se pudo actualizar imagen del album' });
                    } else {
                        res.status(200).send({ album: albumUpdate });
                    }
                }
            });
        } else {
            res.status(500).send({ message: 'Extensión del archivo no valida' });
        }

    } else {
        res.status(404).send({ message: 'No ha subido ninguna imagen' });
    }

}

function getImageFile(req,res){
    var imageFile = req.params.imageFile;
    var path_file = './upload/album/'+imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({ message: 'No existe la imagen...' });
        }
    });
}

module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}