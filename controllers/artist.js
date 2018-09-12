'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;
    Artist.findById(artistId, (err, artist) => {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {

            if (!artist) {
                res.status(404).send({ message: 'El artista no existe' });
            } else {
                res.status(200).send({ artist });
            }
        }
    });

}

function getArtists(req, res) {
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total_registros) {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion ' });
        } else {
            if (!artists) {
                res.status(404).send({ message: 'No hay artistas' });
            } else {
                return res.status(200).send({ registros: total_registros, artists: artists });
            }
        }
    });
}

function saveArtist(req, res) {
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.descripcion = params.descripcion;
    artist.image = 'null';


    artist.save((err, artistStored) => {
        if (err) {
            res.status(500).send({ message: "Error al guardar artista" });
        } else {
            if (!artistStored) {
                res.status(404).send({ message: "El artista no ha sido guardado" });
            } else {
                res.status(200).send({ artist: artistStored });
            }
        }
    });
}

function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdate) => {
        if (err) {
            res.status(500).send({ message: "Error al actualizar artista" });
        } else {
            if (!artistUpdate) {
                res.status(404).send({ message: "El artista no ha sido actualizado" });
            } else {
                res.status(200).send({ message: "Actualización correcta", artist: artistUpdate });
            }
        }
    });
}

function deleteArtist(req, res) {
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({ message: "Error al eliminar artista" });
        } else {
            if (!artistRemoved) {
                res.status(404).send({ message: "Artista no eliminado" });
            } else {

                Album.find({ artist: artistRemoved._id }).remove((err, albumRemoved) => {
                    if (err) {
                        res.status(500).send({ message: "Error al eliminar artista" });
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
                                        res.status(200).send({ artist: artistRemoved });
                                    }
                                }
                            });
                        }
                    }

                });
            }
        }
    });
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        // A continuacion se consigue solo el nombre de la imagen
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || 'jpg' || 'gif') {
   
            Artist.findByIdAndUpdate(artistId, { image: file_name }, (err, artistUpdate) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar imagen artista' });
                } else {
                    if (!artistUpdate) {
                        res.status(404).send({ message: 'No se pudo actualizar imagen artista' });
                    } else {
                        res.status(200).send({ artist: artistUpdate });
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
    var path_file = './upload/artists/'+imageFile;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({ message: 'No existe la imagen...' });
        }
    });
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}