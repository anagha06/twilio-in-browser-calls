$(document).ready(function() {
    let device;

    // Log messages to the chat window
    function log(message) {
        $('#log').append(`<div>> ${message}</div>`);
        console.log(message);  // Also log to browser console
    }

    // Fetch token from the server
    $.getJSON('/token')
        .done(function(data) {
            log('Requesting Access Token...');
            console.log('Token response:', data);  // Debug log the token response
            
            try {
                // Initialize the device
                Twilio.Device.setup(data.token, {
                    debug: true
                });

                log('Device initialized');  // Add log after initialization

                Twilio.Device.ready(function() {
                    log('Twilio.Device Ready!');
                });

                Twilio.Device.error(function(error) {
                    log('Twilio.Device Error: ' + error.message);
                    console.error('Twilio.Device Error:', error);  // Debug log any errors
                });

                Twilio.Device.incoming(function(connection) {
                    log('Incoming connection from ' + connection.parameters.From);
                    // Show incoming call modal
                    $('#incoming-call-modal').modal('show');
                });

                Twilio.Device.connect(function(connection) {
                    log('Successfully established call!');
                    $('#modal-dial').modal('hide');
                    $('#modal-call-in-progress').modal('show');
                });

                Twilio.Device.disconnect(function(connection) {
                    log('Call ended.');
                    $('#modal-call-in-progress').modal('hide');
                });
            } catch (err) {
                log('Error initializing device: ' + err.message);
                console.error('Error initializing device:', err);  // Debug log any initialization errors
            }
        })
        .fail(function(err) {
            console.log('Could not get a token from server!', err);
            log('Could not get a token from server!');
        });

    // Handle making outbound calls
    $('#btnDial').on('click', function() {
        const phoneNumber = $('#phoneNumber').val().trim();
        if (!phoneNumber) {
            log('Please enter a phone number to call');
            return;
        }

        if (Twilio.Device) {
            log(`Attempting to call ${phoneNumber}`);
            const params = {
                To: phoneNumber
            };
            Twilio.Device.connect(params);
        }
    });

    // Handle accepting incoming calls
    $('#accept-call').on('click', function() {
        if (Twilio.Device) {
            Twilio.Device.incoming().accept();
        }
    });

    // Handle rejecting incoming calls
    $('#reject-call').on('click', function() {
        if (Twilio.Device) {
            Twilio.Device.incoming().reject();
        }
    });

    // Handle hanging up calls
    $('#hangup-call').on('click', function() {
        if (Twilio.Device) {
            Twilio.Device.disconnectAll();
        }
    });
}); 