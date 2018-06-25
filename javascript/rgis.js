title = ""
keyword = ""
author = ""
$('#title').bind('input', function () {
    window.title = $(this).val()
    appendsearch();
});


$('#keyword').bind('input', function () {

    window.keyword = $(this).val()
    appendsearch();
});

$('#author').bind('input', function () {

    window.author = $(this).val()
    appendsearch();
});


function appendsearch() {
    appendsearchstr = ""
    if (window.title != "") {

        appendsearchstr = appendsearchstr + "&title=" + window.title;
    }
    if (window.keyword != "") {
        appendsearchstr = appendsearchstr + "&keywords=" + window.keyword;
    }
    if (window.author != "") {
        appendsearchstr = appendsearchstr + "&author=" + window.author;
    }

    Searcher(window.searchurl + appendsearchstr)
}

var searchurl = ""


function bounce(t) {
    var s = 7.5625, p = 2.75, l;
    if (t < (1 / p)) {
        l = s * t * t;
    } else {
        if (t < (2 / p)) {
            t -= (1.5 / p);
            l = s * t * t + 0.75;
        } else {
            if (t < (2.5 / p)) {
                t -= (2.25 / p);
                l = s * t * t + 0.9375;
            } else {
                t -= (2.625 / p);
                l = s * t * t + 0.984375;
            }
        }
    }
    return l;
}



function Searcher(url) {
    console.log(url)
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            var totalPages = data.total;
            //console.log(data)

            if (totalPages > 15) {

                $('#pagination-gstore').twbsPagination('destroy');
                $('#pagination-gstore').twbsPagination({
                    totalPages: totalPages / 15,
                    visiblePages: 10,
                    onPageClick: function (event, page) {
                        offsetnum = page * 15
                        offsetnum = offsetnum - 15
                        newurl = url + "&offset=" + offsetnum
                        //console.log(newurl)
                        $.ajax({
                            url: newurl,
                            type: 'GET',
                            success: function (data) {
                                //console.log(data)
                                html = template(data.results);
                                //console.log(html)
                                $('#results').html(html);
                                $('#page-content').text('Page ' + page);
                            }
                        });
                    }
                });
                html = template(data.results);
                $('#results').html(html);
            } else if (totalPages > 0) {

                $('#pagination-gstore').twbsPagination('destroy');
                $('#pagination-gstore').twbsPagination({
                    totalPages: 1,
                    visiblePages: 1,
                    onPageClick: function (event, page) {
                        offsetnum = 0
                        newurl = url + "&offset=" + offsetnum
                        //console.log(newurl)
                        $.ajax({
                            url: newurl,
                            type: 'GET',
                            success: function (data) {
                                //console.log(data)
                                html = template(data.results);
                                //console.log(html)
                                $('#results').html(html);
                                $('#page-content').text('Page ' + page);
                            }
                        });
                    }
                });
                html = template(data.results);
                $('#results').html(html);
            } else {
                $('#pagination-gstore').twbsPagination('destroy');
                html = '<div class="row lineunderrow"><div class="col-md-12">No Datasets found</div></div>'
                $('#results').html(html);
            };
        },
        error: function (data) {
            console.log(data)
        }
    });
}

$('#pagination-gstore').twbsPagination({
    totalPages: 11,
    visiblePages: 10,
    onPageClick: function (event, page) {
        $('#page-content').text('Page ' + page);
    }
});


Handlebars.registerHelper('escape', function (variable) {
    var lol = variable.replace(/(['"])/g, '\\$1');
    return lol.replace(/([#])/g, '\\$1');
});


if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function (obj) {
            var newArr = this.filter(function (el) {
                return el == obj;
            });
            return newArr.length > 0;
        }
    });
}


if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}


var layerNames = [];

function zoomto(uuid) {

    url = "/apps/rgis/search/datasets.json?uuid=" + uuid


    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            bbox = data.results["0"].spatial.bbox;
            minx = bbox[0]
            miny = bbox[1]
            maxx = bbox[2]
            maxy = bbox[3]
            minxy = [minx, miny]
            maxxy = [maxx, maxy]
            toProjection = "EPSG:4326"
            fromProjection = "EPSG:4326"//+data.results["0"].spatial.epsg



            var animationOptions = {
                duration: 2000
            };

            map.getView().fit(bbox, animationOptions);
        },
        error: function (data) {
            alert('Is this it???');
        }
    });
}




function addtomap(id, name, title) {
    if (name.match(/^\d/)) {
        name = "g_" + name
    }
    found = layerNames.includes(name);
    if (!found) {

        var newlayer = new ol.layer.Tile({
            title: title, //name+"("+title+")",
            source: new ol.source.TileWMS({
                url: '/apps/rgis/datasets/' + id + '/services/ogc/wms',
                params: {
                    'LAYERS': name, 'TILED': true, 'VERSION': '1.1.1'
                },
                serverType: 'mapserver'
            })
        })
        layerNames.push(name)
        map.addLayer(newlayer);
    };
}



Handlebars.registerHelper('equal', function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});


jsontest = {
}
//console.log(jsontest)
results = jsontest.results
//console.log(results)
var template;
var html

$(function () {
    var source = $("#datasets-template").html();
    template = Handlebars.compile(source);
    html = template(results);
    $('#results').html(html);
});

//folders jstree
$('#folders').jstree({
    'core': {
        "check_callback": true,
        'data': {
            "url": "/apps/rgis/folders.json",
            "dataType": "json"
        }
    },
    "plugins": []
}).on('select_node.jstree', function (e, ndata) {
    //console.log(map)
    var folder = $(this).jstree(true).get_node(ndata.node);
    window.searchurl = "/apps/rgis/search/datasets.json?folders=" + folder.id;
    $.ajax({
        url: window.searchurl,
        type: 'GET',
        success: function (data) {
            //console.log("#############")
            //console.log(data);
            //console.log("#############")
            //console.log(data.results.length);
            //console.log("#############")
            //console.log(data.total)

            html = template(data.results);
            $('#results').html(html);
        },
        error: function (data) {
            alert('lol whatever');
        }
    });
}).on('loaded.jstree', function (e, ndata) {
    window.searchurl = "/apps/rgis/search/datasets.json?";
    $.ajax({
        url: window.searchurl,
        type: 'GET',
        success: function (data) {
            //console.log(data);
            //console.log(data.results.length);
            html = template(data.results);
            $('#results').html(html);
        },
        error: function (data) {
            console.log(data)
        }
    });
}).on('open_node.jstree', function (e, ndata) {
    ndata.instance.set_icon(ndata.node, '/images/jstree/bluefolder-open.png')
}).on('close_node.jstree', function (e, ndata) {
    ndata.instance.set_icon(ndata.node, true);
});
//categories jstree
$('#categories').jstree({
    'core': {
        "check_callback": true,
        'data': {
            "url": "https://gstore.unm.edu/apps/rgis/search/categorytree.json",
            "dataType": "json"
        }
    },
    "plugins": []
}).on('select_node.jstree', function (e, ndata) {
    //console.log(map)
    var folder = $(this).jstree(true).get_node(ndata.node);
    //console.log(folder.id)
    var categoryarray = folder.id.split("-^-");
    //console.log(categoryarray);
    var searchstring = ""
    if (categoryarray.length === 1) {
        searchstring = "theme=" + categoryarray[0]
    } else if (categoryarray.length === 2) {
        searchstring = "theme=" + categoryarray[0] + "&subtheme=" + categoryarray[1]
    } else if (categoryarray.length === 3) {
        searchstring = "theme=" + categoryarray[0] + "&subtheme=" + categoryarray[1] + "&groupname=" + categoryarray[2] + "&sort=description"
    };
    //console.log(searchstring)
    window.searchurl = "/apps/rgis/search/datasets.json?" + searchstring;
    //console.log(window.searchurl)
    Searcher(window.searchurl);
}).on('loaded.jstree', function (e, ndata) {
    window.searchurl = "/apps/rgis/search/datasets.json?limt=15";
    Searcher(window.searchurl)
}).on('open_node.jstree', function (e, ndata) {
    ndata.instance.set_icon(ndata.node, '/images/jstree/bluefolder-open.png')
}).on('close_node.jstree', function (e, ndata) {
    ndata.instance.set_icon(ndata.node, true);
});

//var googleLayer = new olgm.layer.Google();

var layers = [
    //                new ol.layer.Tile({
    //                     source: new ol.source.OSM()
    //           })


    new ol.layer.Group({
        'title': 'Base maps',
        layers: [
            new ol.layer.Group({
                title: 'Watercolor',
                type: 'base',
                combine: true,
                visible: false,
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.Stamen({
                            layer: 'watercolor'
                        })
                    }),
                    new ol.layer.Tile({
                        source: new ol.source.Stamen({
                            layer: 'terrain-labels'
                        })
                    })]
            }),
            new ol.layer.Tile({
                title: 'OSM',
                type: 'base',
                visible: true,
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                title: 'Bing',
                type: 'base',
                visible: false,
                source: new ol.source.BingMaps({
                    key: 'Ahk8GEcI1V0I7ArMAJpMG6eUedGOsN_EFo9R5kaJcNxjpZYT98KrCPQxD-5CN0-p',
                    imagerySet: 'Road'
                })
            })]
    })]


var view = new ol.View({
    projection: 'EPSG:4326',
    center: [-106.182861, 34.25],
    zoom: 7
});

var map = new ol.Map({
    layers: layers,
    target: 'map',
    view: view
});


var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Légende' // Optional label for button
});

map.addControl(layerSwitcher);