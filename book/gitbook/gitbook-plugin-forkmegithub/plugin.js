require(['gitbook', 'jQuery'], function (gitbook, $) {
  var colorRibbons = {
    red: {
      src: 'https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67',
      canonicalSrc: 'https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png',
    },
    green: {
      src: 'https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67',
      canonicalSrc: 'https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png',
    },
    darkblue: {
      src: 'https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67',
      canonicalSrc: 'https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png',
    },
    orange: {
      src: 'https://camo.githubusercontent.com/652c5b9acfaddf3a9c326fa6bde407b87f7be0f4/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6f72616e67655f6666373630302e706e67',
      canonicalSrc: 'https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png',
    },
    gray: {
      src: 'https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67',
      canonicalSrc: 'https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png',
    },
  };
  
  var forkmeRibbon;
  var pluginConfig = {};
  function initializePlugin(config) {
    pluginConfig = config.forkmegithub;

    var colorRibbon = colorRibbons[pluginConfig.color];
    forkmeRibbon
      = '<a id="forkmegithub" href="' + pluginConfig.url + '">'
      + '<img src="' + colorRibbon.src + '" alt="Fork me on GitHub"'
      + 'data-canonical-src="' + colorRibbon.canonicalSrc + '"></img>'
      + '</a>'
      ;
  }

  function getPluginConfig() {
    return pluginConfig;
  }

  gitbook.events.bind('start', function (e, config) {
    initializePlugin(config);

    gitbook.toolbar.createButton({
      icon: 'fa fa-github',
      label: 'GitHub',
      position: 'right',
      onClick: function() {
        window.open(pluginConfig.url);
      }
    });
  });

  gitbook.events.bind('page.change', function() {
    var bodyInner = $('.book .book-body .body-inner');
    bodyInner.append(forkmeRibbon);
  });
});

