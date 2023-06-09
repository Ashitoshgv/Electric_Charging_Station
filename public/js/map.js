// Adds interactive map using Mapbox GL JS

// Opens map drawer on click
$("#map-drawer-expansion-button").on("click", () => {
    $("#map-drawer").toggleClass("map-side-expanded");
    $("#map-drawer-details-wrapper").slideToggle(350);
    $("#map-drawer-expansion-button").toggleClass("fa-chevron-up fa-chevron-down");
});

// Hides map drawer on click
$("#map-drawer-close-button").on("click", () => {
    $("#map-drawer").hide();
});

// Generates popup for booking
$('#map-drawer').on("click", '#request-booking-button', () => {
    createPopup();
    setPopupBookingPageOne();
    checkSelected();
});

// Checks if any time has been selected. Disables confirm button if none are selected.
function checkSelected() {
    var selected = document.getElementsByClassName('button-selected');
    if (selected[0] === undefined) {
        $('#popup-confirm').prop('disabled', true);
        $('#popup-confirm').addClass('disabled-button');
        $('#popup-confirm').html('Please select a time!');
    } else {
        $('#popup-confirm').removeClass('disabled-button');
        $('#popup-confirm').prop('disabled', false);
        $('#popup-confirm').html('Request Booking');
    }
}

// Event listener for clicking confirm button for a booking
$('body').on("click", "#popup-confirm", (e) => {

    //Store date and time
    var date = $("#datepicker").val();;
    var time = $("#popup-time").html();

    // Advance booking process to next page
    popupPageOne = $("#popup").children().not("#popup-close-button").detach();
    setPopupBookingPageTwo(date, time);
});

// Back button for booking popup
$('body').on("click", "#popup-back", (e) => {
    $("#popup").children().not("#popup-close-button").remove();
    $("#popup").prepend(popupPageOne);
    e.stopPropagation();
});

// Event listener for clicking second confirm button
const successfulBooking = (e) => {
    var date = $("#popup-date").html();
    var time = $("#popup-time").html();
    // Advance to next page of booking popup
    $("#popup").children().not("#popup-close-button").remove();
    setPopupBookingPageThree(date, time);
}

// Adds a new time slot button
var addTimeSlot = (startTime, endTime) => {
    var timeSlot = document.createElement('button');
    timeSlot.className = "time-slot-button";
    timeSlot.innerHTML = startTime + " - " + endTime;
    $("#popup-time-slots").append(timeSlot);
}

// Creates the first page of the Booking popup
var setPopupBookingPageOne = () => {
    createPopupHeader("h3", "Book a Time", "booking-header", "popup-header");
    createPopupHeader("div", "<b id='popup-date'><input type='text' readonly class='form-input' id='datepicker' value='" + "Please select a day" + "'></b>", "booking-datepicker"), "popup-subheader";
    let currDate = new Date();
    $("#datepicker").datepicker({
        dateFormat: "yy-mm-dd",
        minDate: currDate
    });
    createPopupContent("popup", "div", "popup-time-slots", "full-center-wrapper");

    createPopupConfirmButton("popup-confirm", "Request Booking");
    createPopupCancelButton("popup-cancel", "Cancel");
}

// Creates the second page of the Booking popup
var setPopupBookingPageTwo = (date, time) => {
    createPopupHeader("h5", "You have requested: <b id='popup-date'>" + date + "</b> at <b id='popup-time'>" + time + "</b>. Do you wish to confirm this booking request?", "booking-confirmation-text", "popup-subheader");
    createPopupConfirmButton("popup-confirm-validate", "Confirm");
    createPopupCancelButton("popup-back", "Back");
}

// Creates the third page of the Booking popup
var setPopupBookingPageThree = (date, time) => {
    createPopupHeader("h5", "Your booking for <b id='popup-date'>" + date + "</b> at <b id='popup-time'>" + time + "</b> has been sent. Please wait for a confirmation from the host before making your payment.", "booking-finish-text", "popup-subheader");
    createPopupCancelButton("popup-cancel", "Close");
}

// Colour change for time slot button
$('body').on("click", ".time-slot-button", (e) => {
    e.preventDefault();
    $(".time-slot-button").removeAttr("id");
    $(e.target).attr("id", "popup-time");
    $(e.target).toggleClass('button-selected');
    $(".time-slot-button:not('#popup-time')").removeClass('button-selected');
    checkSelected();
    e.stopPropagation();
});

// Renders charger information onto drawer
$('body').on("click", ".marker", async (e) => {
    e.preventDefault();
    try {
        const url = '/charger/query?charger_id=' + e.target.id;
        const response = await fetch(url);
        const json = await response.json();
        const data = json['0'];
        const chargername = data['chargername']
        const city = data['city']
        const cost = data['cost']
        const details = data['details']
        const level = data['level']
        const type = data['type']   
        const rating = data['rating']
        $("#map-drawer").show();
        populateChargerInfo(e.target.id, chargername, city, cost, details, level, type, rating);
    } catch (error) {
        console.log("Error: ", error)
    }
});

const buildStars = (rating) => {
    if (rating === 0) {
        html = '<span class="host-marker-stars-drawer"></span>'
    } else {
        let numOfStars = ''

        for (let i = 0; i < Math.floor(rating); i++) {
            numOfStars = numOfStars + '<i class="fas fa-star"></i>'
        }

        for (let i = 0; i < 5 - Math.floor(rating); i++) {
            numOfStars = numOfStars + '<i class="far fa-star"></i>'
        }
        html = '<span class="host-marker-stars">' + numOfStars + '</span>' + '  ' + rating.toFixed(2)
    }
    return html;
}

const addReview = (review) => {    
    card = $("<div class='card-panel'>"
        + "<div class='price-card-text-wrapper price-card-text-lg'>" + review.rating + " " + '<i class="review-star fa fa-star"></i>' + "</div>"
        + "<div class='card-text-lg green-highlight'>" + review.reviewer + "</div>"
        + "<div class='card-text-md'>" + getLocalDate(new Date(review.date)) + " " + getLocalStartTime(new Date(review.date)) + "</div>"
        + "<div class='card-text-sm'>" + review.details + "</div>"
        + "</div>");
    $('#reviews-content').append(card)
};

const displayReviews = (res) => {
    createPopup();
    createPopupHeader('h3', 'Reviews', 'reviews-popup', 'popup-header');
    createPopupContent('popup', 'div', 'reviews-content', 'full-center-wrapper');

    res.forEach(review => {
        addReview(review);
    })
}

const fetchReviews = async (chargerid) => {
    const response = await fetch("/host/chargerReviews?cUID=" + chargerid, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        }
    })
    const res = await response.json();
    displayReviews(res);
}

// Pulls and displays Charger information for map display
const populateChargerInfo = (chargerid, chargername, city, cost, details, level, type, rating) => {
    $('#map-drawer-text-wrapper').children().remove();
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row" id="map-drawer-charger-name">' + chargername + '</div>')
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row"><div class="map-drawer-text-left">City</div><div class="map-drawer-text-right">' + city + '</div></div><br>')
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row"><div class="map-drawer-text-left">Level</div><div class="map-drawer-text-right">' + level + '</div></div><br>')
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row"><div class="map-drawer-text-left">Type</div><div class="map-drawer-text-right">' + type + '</div></div><br>')
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row"><div class="map-drawer-text-left">Hourly Rate</div><div class="map-drawer-text-right">₹' + cost.toFixed(2) + '</div></div><br>')
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row"><div id="stars-rating" class="map-drawer-text-left">' + buildStars(rating) + '</div></div><br>')
    $('#map-drawer-text-wrapper').append('<div class="map-drawer-text-row" id="map-drawer-details-wrapper"><div class="map-drawer-text-left">Additional Details</div><br><div class="map-drawer-text-left" id="map-drawer-details">' + (details !== '' ? details : "<i>None</i>") + '</div></div>');
    $('#map-drawer-text-wrapper').append('<button id="request-booking-button" class="orange-button">REQUEST BOOKING</button>')

    if (rating !== 0) {
        $('#stars-rating').after('<div id="reviews-button" class="map-drawer-text-right orange-highlight">See Reviews</div>');
    }

    $('body').on('click', '#reviews-button', (e) => {
        fetchReviews(chargerid);
    })
    // Check JSON Web Token authentication
    // If valid, allow booking
    if (jwt) {
        // When changing days, display new time slots
        $('body').off('change', '#datepicker');
        $('body').on('change', '#datepicker', async (evt) => {
            evt.preventDefault();
            try {
                let date = $('#' + evt.target.id).val();
                const url = '/charger/schedule?cUID=' + chargerid + "&date=" + date;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                })

                // Create array with unbooked time slots
                let json = await response.json();
                let arr = ['00:00:00', '01:00:00', '02:00:00', '03:00:00', '04:00:00', '05:00:00',
                    '06:00:00', '07:00:00', '08:00:00', '09:00:00', '10:00:00', '11:00:00',
                    '12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00',
                    '18:00:00', '19:00:00', '20:00:00', '21:00:00', '22:00:00', '23:00:00'];
                if (json['0'] !== null) {
                    json.forEach((item) => {
                        let localDate = new Date(item.startTime);
                        currItemStartTimeIndex = localDate.getHours();
                        delete arr[parseInt(currItemStartTimeIndex, 10)];
                    })
                }

                // Only display time slots which are not before current time
                $("#popup-time-slots").children().remove();
                let currDate = new Date();
                arr.forEach((startTime) => {
                    localTime = new Date(startTime);
                    if (new Date(date + " " + startTime) > currDate) {
                        addTimeSlot((parseInt(startTime.substring(0, 2))) + startTime.substring(2, 5),
                            (parseInt(startTime.substring(0, 2)) + 1) + startTime.substring(2, 5));
                    }
                })
            } catch (error) {
                console.log("Error: ", error)
            }
        });
            
        // Sends POST request to add a new booking
        $('body').off('click', '#popup-confirm-validate');
        $('body').on('click', '#popup-confirm-validate', async (evt) => {
            const date = $('#popup-date').html();
            const startTime = $('#popup-time').html().split(' - ')[0];
            const endTime = $('#popup-time').html().split(' - ')[1];
            const url = 'booking/newBooking'
            const data = {
                charger: chargerid,
                timeStart: date + " " + startTime,
                timeEnd: date + " " + endTime
            }
            try {
                fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + jwt
                    }
                }).then(response => successfulBooking());
            } catch (error) {
                console.log("Error: ", error)
            }
        });
    } else {
        $('#request-booking-button').prop('disabled', true);
        $('#request-booking-button').addClass('disabled-button');
        $('#request-booking-button').html('Please login to continue!');
    }
}