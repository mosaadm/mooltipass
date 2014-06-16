/* CDDL HEADER START
 *
 * The contents of this file are subject to the terms of the
 * Common Development and Distribution License (the "License").
 * You may not use this file except in compliance with the License.
 *
 * You can obtain a copy of the license at src/license_cddl-1.0.txt
 * or http://www.opensolaris.org/os/licensing.
 * See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * When distributing Covered Code, include this CDDL HEADER in each
 * file and include the License file at src/license_cddl-1.0.txt
 * If applicable, add the following below this CDDL HEADER, with the
 * fields enclosed by brackets "[]" replaced with your own identifying
 * information: Portions Copyright [yyyy] [name of copyright owner]
 *
 * CDDL HEADER END
 */

/* Copyright (c) 2014 Darran Hunt. All rights reserved. */

/*!      \file content.js
*        \brief        Mooltipass Chrome Authentication plugin
*        Created: 14/6/2014
*        Author: Darran Hunt
*
*        Scans web pages for authentication inputs and then requests values for those inputs
*        from the Mooltipass.
*/


console.log('mooltipass content script loaded');

function getCredentialFields() 
{
    var fields = ['password', 'email'];
    var elements = document.getElementsByTagName('input');
    var result = [];

    for (var i=0; i<elements.length; i++) {
        var input = elements[i] 
        var type = input.type.toLowerCase()
        console.log('input: "'+input.id+'" ('+input.type+') ');
        if ($.inArray(type, fields) != -1) {
            console.log('pushed "'+input.id+'" ('+input.type+') ');
            result.push({id: input.id, type:input.type});
        }
    }

    return result;
}

function getSubmitFields() 
{
    var fields = ['submit'];
    var elements = document.getElementsByTagName('input');
    var result = [];

    for (var i=0; i<elements.length; i++) {
        var input = elements[i] 
        var type = input.type.toLowerCase()
        console.log('input: "'+input.id+'" ('+input.type+') ')
        if ($.inArray(type, fields) != -1) {
            console.log('sub: pushed "'+input.id+'" ('+input.type+') ')
            result.push({id: input.id, type: input.type});
        }
    }

    return result;
}

var mpCreds = null;
var credFields = null;
var credFieldsArray = null;

function checkSubmittedCredentials()
{
    if (!credFields) 
    {
        // no credential fields, nothing to do here
        return;
    }

    if (mpCreds) {
        // we have some, see if the values differ from what the mooltipass has
        creds = {};
        var updates = [];
        for (var ind=0; ind<mpCreds.fields.length; ind++) 
        {
            input = document.getElementById(mpCreds.fields[ind].id);
            console.log('check: input '+input.value+' and '+mpCreds.fields[ind].value);
            if (input.value != mpCreds.fields[ind].value) {
                console.log('input '+input.id+' value '+input.value+' changed from '+mpCreds.fields[ind].value);
                updates.push({id: input.id, name: input.name, value: input.value, type: input.type});
            } else {
                console.log('input '+input.id+' value '+input.value+' unchanged');
            }
        }

        if (updates.length > 0) {
            // Offer to update the mooltpass with the new value(s)
            if (!document.getElementById('mpDialog')) {
                var layerNode= document.createElement('div');
                layerNode.setAttribute('id', 'mpDialog');
                layerNode.setAttribute('title','Mooltipass');
                var pNode= document.createElement('p');
                pNode.innerHTML = 'Mooltipass dialog placeholder';
                layerNode.appendChild(pNode);
                document.body.appendChild(layerNode);
            }
            $( "#mpDialog" ).dialog({
                resizable: false,
                height:140,
                modal: true,
                buttons: {
                    "Update Mooltipass credentials": function() {
                        chrome.runtime.sendMessage({type: 'update', url: window.location.href, inputs: updates});
                        $( this ).dialog( "close" );
                    },
                    Skip: function() {
                        $( this ).dialog( "close" );
                    }
                }
            });
        }

    } else {
        // we don't have any, see if the user wants to add some
    }
}


addEventListener('DOMContentLoaded', function f() 
{
    removeEventListener('DOMContentLoaded', f, false);
    console.log('mooltipass content script triggered');
    var forms = document.getElementsByTagName('form');
    $('form').submit(function(event) {
        console.log('checking submitted credentials');
        // see if we should store the credentials
        checkSubmittedCredentials();
        // uncomment this line to prevent the credentials being sent to the server
        //event.preventDefault();
    });
    credFields = getCredentialFields();
    // send an array of the input fields to the mooltipass
    //credFieldsArray =  $.map(credFields, function(value, key) {
    //      return {id: key, type:value} ;
    //});
    if (credFields.length > 0) {
        // send a message back to the extension
        chrome.runtime.sendMessage({type: 'inputs', url: window.location.href, inputs: credFields}, function(response) {
            console.log('content: got response ' + JSON.stringify(response));
        });
    }
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
        if (request.type == 'credentials') 
        {
            mpCreds = request;
            // update the inputs
            for (var ind=0; ind<request.fields.length; ind++) {
                console.log('set: "'+request.fields[ind].id+'" = "'+request.fields[ind].value+'"');
                document.getElementById(request.fields[ind].id).value = request.fields[ind].value;
            }
        }
});
