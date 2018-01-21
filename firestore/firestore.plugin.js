/*****************************************************************************
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Wolfgang Flohr-Hochbichler
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *****************************************************************************/
(function()
{
    // ## A Datasource Plugin
    //
    // -------------------
    // ### Datasource Definition
    //
    // -------------------
    // **freeboard.loadDatasourcePlugin(definition)** tells freeboard that we are giving it a datasource plugin. It expects an object with the following:
    freeboard.loadDatasourcePlugin({
        "type_name"   : "firestore",
        "display_name": "Firestore Datasource",
        "description" : "Datasource for <strong>Firestore</strong> database",
        "external_scripts" : [
            "//www.gstatic.com/firebasejs/4.9.0/firebase.js",
            "//www.gstatic.com/firebasejs/4.9.0/firebase-firestore.js"
        ],
        "settings"    : [
            {
                "name"         : "apiKey",
                "display_name" : "Firestore API key",
                "type"         : "text",
                "required" : true
            },
            {
                "name"        : "authDomain",
                "display_name": "Auth domain",
                "type"        : "text"
            },
            {
                "name"        : "projectId",
                "display_name": "Project ID",
                "type"        : "text"
            },
            {
                "name"        : "collection",
                "display_name": "Collection",
                "type"        : "text"
            },
            {
                "name"        : "documentId",
                "display_name": "Document ID",
                "type"        : "text"
            }
        ],

        newInstance   : function(settings, newInstanceCallback, updateCallback)
        {
            // myDatasourcePlugin is defined below.
            newInstanceCallback(new myDatasourcePlugin(settings, updateCallback));
        }
    });


    // ### Datasource Implementation
    //
    // -------------------
    var myDatasourcePlugin = function(settings, updateCallback)
    {
        // Always a good idea...
        var self = this;
        var fsDocRef;
        var unsubscribe;

        var currentSettings = settings;

        // Initialize Cloud Firestore through Firebase
        firebase.initializeApp({
            apiKey: currentSettings.apiKey,
            authDomain: currentSettings.authDomain,
            projectId: currentSettings.projectId
        });

        var db = firebase.firestore();

        function init() {
            if (unsubscribe) {
                unsubscribe();
            }
            fsDocRef = db.collection(currentSettings.collection).doc(currentSettings.documentId);
            unsubscribe = fsDocRef.onSnapshot(function (doc) {
                updateCallback(doc.data());
            });
        }

        function getData() {
            fsDocRef.get().then(function(doc) {
                if (doc.exists) {
                    updateCallback(doc.data());
                } else {
                    console.log("No such document!", currentSettings.collection + '/' + currentSettings.documentId);
                    updateCallback({});
                }
            }).catch(function(error) {
                console.error("Error getting document:", error);
            });
        }

        self.onSettingsChanged = function(newSettings) {
            // Here we update our current settings with the variable that is passed in.
            currentSettings = newSettings;
            init();
        }

        self.updateNow = function() {
            getData();
        }

        self.onDispose = function() {
            unsubscribe();
        }

        init();
    }
}());
