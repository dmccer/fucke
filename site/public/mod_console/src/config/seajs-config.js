seajs.config({
	debug: true,
	preload: ["plugin-text", "plugin-json"],
	alias: {
		'jquery': 'f/../../../jquery/src/jquery',
		'underscore': 'f/../../../underscore/src/underscore-debug',
		'bootstrap': 'f/../../../bootstrap/js/bootstrap',
		'component': 'f/../../../component',
		'mod_console': 'f/../../../mod_console/src',

		'request': 'f/../../../component/ajax/request',
		'util': 'f/../../../component/util',
		"config": "f/../../../mod_console/src/config"
	}
});

seajs.config({
    alias: {
        "app": seajs.mock ? 'f/../../../mod_console/src/mock-server' : location.protocol + "//" + location.hostname + ":" + location.port
    }
});