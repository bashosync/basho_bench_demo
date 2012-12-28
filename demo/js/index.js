var graphConfig;
var metrics = {}; 
var g = new Graphene;

function statsSourceUrl(targets, opts) {
  opts = opts || {};
  from = opts.from || "-2seconds";
  type = opts.type || "gauge"
  func = opts.func || "";

  open = "";
  close = "";
  if(func !== "") { open = "("; close = ")"; }

  if(type === "gauge") {
    type = "stats.gauges.";
  }
  else if(type === "counter") {
    type = "stats_counts.";
    type = "stats.";
  }

  url = location.protocol + '//' + location.host + '/render/?from=' + from + '&format=json&noCache=true';
  if($.isArray(targets)) {
    $.each(targets, function(key, target) {
      url = url + '&target=' + func + open + type + target + close;
    });
  }
  else {
    url = url + '&target=' + func + open + type + targets + close;
  }
  return url;
}

function buildGraphs(object) {

  if(!object) {
    object = graphConfig;

    $.each(object, function(index, value) {
      $.each(value, function(index2, value2) {
        if($.type(value2) == 'object') {
          $(value2.parent).empty();
        }
      });
    });
  }

  g.build($.extend(true, true, object));
}

function removeGraph(object, item) {
  $.each(object, function(index, value) {
    $.each(value, function(index2, value2) {
      if($.type(value2) == 'object' && value2.parent == item) {
        delete object[index];
        $(item).remove();
      }
    });
  });
}

function addGraph(name, source, from, refresh_interval, type, parent) {
  var tempObj = new Object();

  if(parent == null) {
    id = 'g' + Math.floor(Math.random()*99999).toString();
    $('#dynamic-rows .sortable').append('<li id="' + id + '" draggable="true" style="display: list-item;" />');
    parent = '#' + id;
  }

  tempObj[name] = {"source": statsSourceUrl(source, {"from": from}), "refresh_interval": refresh_interval} 
  tempObj[name][type] = {"parent": parent, "title": name};
  graphConfig[name] = {"source": statsSourceUrl(source, {"from": from}), "refresh_interval": refresh_interval} 
  graphConfig[name][type] = {"parent": parent, "title": name};

  buildGraphs(tempObj);
}


var graphConfig = {
    "Throughput": {
        "source": statsSourceUrl("node_*.test.*_throughput", {"func": "averageSeries"}),
        "refresh_interval": "1000",
        "GaugeLabel": {
            "parent": "#hero-one",
            "title": "Throughput",
            "unit": "req/s"
        }
    },
    "Latency": {
      "source": statsSourceUrl("node_*.test.*_latency", {"func": "averageSeries"}),
      "refresh_interval": 4000,
      "GaugeGadget": {
        "parent": "#hero-one",
        "title": "LATENCY",
        "to": 20
      }
    },
    "Errors": {
      "source": statsSourceUrl("node_*.test.error_count", {"func": "sumSeries"}),
      "refresh_interval": 1000,
      "GaugeLabel": {
        "parent": "#hero-three",
        "title": "Error Count",
        "value_format": "02d",
      }
    },
    "Object Count": {
      "source": statsSourceUrl("cluster.riak.object_count"),
      "refresh_interval": 1000,
      "GaugeLabel": {
        "parent": "#hero-two",
        "title": "Object Count",
        "value_format": ",02d",
      }
    },
    "Completion": {
      "source": statsSourceUrl("cluster.test.completion"),
      "refresh_interval": 1000,
      "GaugeGadget": {
        "parent": "#hero-two",
        "title": "Complete",
        "to": 100
      }
    },
    "Cluster Throughput": {
      "source": statsSourceUrl("node_*.test.*_throughput", {"from": "-2minutes", "func": "sumSeries"}),
      "refresh_interval": 2000,
      "TimeSeries": {
        "parent": "#cluster-throughput",
        "title": "Cluster Throughput",
        "num_labels": 0,
      },
    },
    "Cluster Latency": {
      "source": statsSourceUrl("node_*.test.read_latency, node_*.test.write_latency", {"from": "-2minutes", "func": "averageSeries"}),
      "refresh_interval": 2000,
      "TimeSeries": {                
        "parent": "#cluster-latency",            
        "title": "Cluster Latency",
      },                                  
    },
    "Vnode Gets": {
      "source": statsSourceUrl("node_*.riak.vnode_gets", {"from": "-5minutes"}),
      "refresh_interval": 2000,
      "TimeSeries": {
        "parent": "#objects-per-node",
        "title": "Vnode Gets",
      },                 
    }, 
    "Read Repairs": {
      "source": statsSourceUrl("node_*.riak.read_repairs", {"from": "-2minutes"}),
      "refresh_interval": 2000,
      "TimeSeries": {
        "parent": "#handoffs",
        "title": "Read Repairs",
      },                 
    }, 
};

addGraph("node_1", "node_1.test.*_throughput", "-2minutes", 2000, 'TimeSeries');
addGraph("node_2", "node_2.test.*_throughput", "-2minutes", 2000, 'TimeSeries');
addGraph("node_3", "node_3.test.*_throughput", "-2minutes", 2000, 'TimeSeries');
addGraph("node_4", "node_4.test.*_throughput", "-2minutes", 2000, 'TimeSeries');

$(document).ready(function(){
    $('#start-button').click(function(){
    $.get('/cgi-bin/write.sh');                                                                                                                                                                                                              
    $(this).attr("disabled", "disabled");
    return false;
  });                                                                                                                                                                                                                                        
  $('#verify-button').click(function(){
    $.get('/cgi-bin/verify.sh');                                                                                                                                                                                                             
    $(this).attr("disabled", "disabled");
    return false;
  });                                                                                                                                                                                                                                        
  $('#delete-button').click(function(){
    $.get('/cgi-bin/delete.sh');                                                                                                                                                                                                             
    $(this).attr("disabled", "disabled");
    return false;
  });                                                                                                                                                                                                                                        
  $('#reset-button').click(function(){
    $.get('/cgi-bin/stop.sh');                                                                                                                                                                                                               
    $('#start-button').removeAttr("disabled");
    $('#verify-button').removeAttr("disabled");
    $('#delete-button').removeAttr("disabled");
    return false;
  });

  //When the link that triggers the message is clicked fade in overlay/msgbox
  $(".btn-orange").click(function(){
    $('#dim').fadeIn().delay(3000).fadeOut();
    return false;
  });

  $('#add-graph-button').click(function() {
    addGraph($('#graph_title').val(), $("#select_attribute").val(), '-2minutes', '2000', 'TimeSeries');    
  });


  $('#dynamic-rows li').live('mouseenter', function() {
    $(this).append('<button type="button" class="close">&times;</button>')
    $('.close').click(function() {
      removeGraph(graphConfig, '#' + $(this).parent().attr('id'));
    });
  });

  $('#dynamic-rows li').live('mouseleave', function() {
    $('.close').remove();
  });

  $('#sortable2').sortable();

  // Populate metrics object
  $.getJSON('/metrics/index.json', function(data) { 
    $.each(data, function(key, val) { 
      if(val.match(/^stats.gauges/)) { 
        stat = val.split('.');
        if(metrics[stat[2]]) {
          if(metrics[stat[2]][stat[3]]) { 
            metrics[stat[2]][stat[3]].push(stat[4]); 
          } 
          else {
            metrics[stat[2]][stat[3]] = [];
            metrics[stat[2]][stat[3]].push(stat[4]);
          }  
        }
        else {
          metrics[stat[2]] = {};
          metrics[stat[2]][stat[3]] = [];
          metrics[stat[2]][stat[3]].push(stat[4]);
        }
      } 
    }); 

    $.each(metrics, function(node) {
      var optGroup = $('<optgroup label="' + node + '" />');
      $.each(metrics[node]['riak'], function(key, metric) {
       optGroup.append(new Option(node + '.' + 'riak' + '.' + metric)); 
      });
      $.each(metrics[node]['test'], function(key, metric) {
       optGroup.append(new Option(node + '.' + 'test' + '.' + metric)); 
      });
      $('#select_attribute').append(optGroup);
    });
    $('#select_attribute').chosen();
  });
  
  buildGraphs();
});

// Adjust graph sizes on window resize
$(window).bind("resize", function(){
  buildGraphs();
});
