const { 
    startAuthentication,
    browserSupportsWebAuthn,
    startRegistration, 
} = SimpleWebAuthnBrowser;

const elemSuccess = document.querySelector('#authSuccess');
const elemError = document.querySelector('#authError');
const elemDebug = document.querySelector('#authDebug');
const tempUserId = generateGuid();

// HELPERS 
function stopSubmit(event) {
    event.preventDefault();
}

/**
 * A simple way to control how debug content is written to a debug console element
 */
function printDebug(elemDebug, title, output) {
    if (elemDebug.innerHTML !== '') {
        elemDebug.innerHTML += '\n';
    }
    elemDebug.innerHTML += `// ${title}\n`;
    elemDebug.innerHTML += `${output}\n`;
}

function hideControlsContainer() {
    document.querySelector('.registration').style.display = 'none';
}

function showWelcomeContainer() {
    document.querySelector('.welcome-container').style.display = 'block'
}

// simple GUID generator, but with weak uniquenes gaurantes, but good enough for our POC
function generateGuid() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

async function preAuthInit() {
    // fetch the initial auth options
    console.log('userID', tempUserId)
  try { 
    const resp = await fetch(`/generate-authentication-options?userId=${tempUserId}`);
    const opts = resp.json()
    console.log('Authentication Options (Autofill)', opts);
    const asseResp = await startAuthentication(opts, true)
    // We can assume the DOM has loaded by now because it had to for the user to be able
    // to interact with an input to choose a credential from the autofill


    printDebug(elemDebug, 'Authentication Response (Autofill)', JSON.stringify(asseResp, null, 2));

    const verificationResp = await fetch(`/verify-authentication?userId=${tempUserId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(asseResp),
    });

    const verificationJSON = await verificationResp.json();
    printDebug(elemDebug, 'Server Response (Autofill)', JSON.stringify(verificationJSON, null, 2));

    if (verificationJSON && verificationJSON.verified) {
        elemSuccess.innerHTML = `User authenticated!`;
    } else {
        elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
            verificationJSON,
        )}</pre>`;
    }
  } catch(err) {
    console.error('Unexpected error on preAuthInit', err);
  }

}

/**
 * Registration
 */
async function registrationHandler() {
    const elemSuccess = document.querySelector('#regSuccess');
    const elemError = document.querySelector('#regError');
    const elemDebug = document.querySelector('#regDebug');

    // Reset success/error messages
    elemSuccess.innerHTML = '';
    elemError.innerHTML = '';
    elemDebug.innerHTML = '';

    const resp = await fetch(`/generate-registration-options?userId=${tempUserId}`);

    let attResp;
    try {
        const opts = await resp.json();

        // Require a resident key for this demo
        opts.authenticatorSelection.residentKey = 'required';
        opts.authenticatorSelection.requireResidentKey = true;
        opts.extensions = {
            credProps: true,
        };

        printDebug(elemDebug, 'Registration Options', JSON.stringify(opts, null, 2));

        attResp = await startRegistration(opts);
        printDebug(elemDebug, 'Registration Response', JSON.stringify(attResp, null, 2));
    } catch (error) {
        if (error.name === 'InvalidStateError') {
            elemError.innerText = 'Error: Authenticator was probably already registered by user';
        } else {
            elemError.innerText = error;
        }

        throw error;
    }

    const verificationResp = await fetch(`/verify-registration?userId=${tempUserId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(attResp),
    });

    const verificationJSON = await verificationResp.json();
    printDebug(elemDebug, 'Server Response', JSON.stringify(verificationJSON, null, 2));

    if (verificationJSON && verificationJSON.verified) {
        elemSuccess.innerHTML = `Authenticator registered!`;
    } else {
        elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
            verificationJSON,
        )}</pre>`;
    }
}

/**
 * AUTHENTICATION
 */
async function authHandler() {
    const elemSuccess = document.querySelector('#authSuccess');
    const elemError = document.querySelector('#authError');
    const elemDebug = document.querySelector('#authDebug');

    // Reset success/error messages
    elemSuccess.innerHTML = '';
    elemError.innerHTML = '';
    elemDebug.innerHTML = '';

    const resp = await fetch(`/generate-authentication-options?userId=${tempUserId}`);

    let asseResp;
    try {
        const opts = await resp.json();
        printDebug(elemDebug, 'Authentication Options', JSON.stringify(opts, null, 2));

        asseResp = await startAuthentication(opts);
        printDebug(elemDebug, 'Authentication Response', JSON.stringify(asseResp, null, 2));
    } catch (error) {
        elemError.innerText = error;
        throw new Error(error);
    }

    const verificationResp = await fetch(`/verify-authentication?userId=${tempUserId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(asseResp),
    });

    const verificationJSON = await verificationResp.json();
    printDebug(elemDebug, 'Server Response', JSON.stringify(verificationJSON, null, 2));

    if (verificationJSON && verificationJSON.verified) {
        elemSuccess.innerHTML = `User authenticated!`;
        hideControlsContainer();
        showWelcomeContainer();
    } else {
        elemError.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
            verificationJSON,
        )}</pre>`;
    }
}

(async () => {
    await preAuthInit();
    // Hide the Begin button if the browser is incapable of using WebAuthn
    if (!browserSupportsWebAuthn()) {
        document.querySelector('.controls').style.display = 'none';
        document.querySelector('.systemError').innerText = "It seems this browser doesn't support WebAuthn...";
    } else {
        // registration btn handler 
        document.querySelector('#btnRegBegin').addEventListener('click', registrationHandler)
        // auth btn handler
        document.querySelector('#btnAuthBegin').addEventListener('click', authHandler);
    }
})()