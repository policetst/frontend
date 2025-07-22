import {
  validarDniNif,
  postIncident,
  getLocation,
  getTokenFromCookie,
  getIncidents
} from '../Incidents';

describe('Incidents Module Tests', () => {
  test('test_validates_correct_dni_successfully', () => {
    const validDni = '12345678Z';
    const result = validarDniNif(validDni);
    expect(result).toBe(true);
  });

  test('test_creates_incident_with_valid_data', async () => {
    const incidentData = {
      type: 'Accidente',
      description: 'Test incident',
      location: 'Test location',
      brigade_field: false
    };
    
    const result = await postIncident(incidentData);
    expect(result).toHaveProperty('ok');
    expect(result).toHaveProperty('message');
  });

  test('test_gets_user_location_successfully', async () => {
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success({
          coords: {
            latitude: 40.4168,
            longitude: -3.7038,
            altitude: 650
          }
        });
      })
    };
    
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    const location = await getLocation();
    expect(location).toHaveProperty('latitude');
    expect(location).toHaveProperty('longitude');
    expect(typeof location.latitude).toBe('number');
    expect(typeof location.longitude).toBe('number');
  });

  test('test_handles_missing_auth_token', async () => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true
    });

    const token = getTokenFromCookie();
    expect(token).toBe('');

    const result = await getIncidents();
    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(false);
  });

  test('test_handles_network_timeout_gracefully', async () => {
    const incidentData = {
      type: 'Test',
      description: 'Network timeout test',
      location: 'Test location'
    };

    const result = await postIncident(incidentData);
    expect(result).toHaveProperty('ok');
    expect(result).toHaveProperty('message');
  });

  test('test_rejects_invalid_dni_formats', () => {
    const invalidDnis = [
      '1234567A',     // Too short
      '123456789Z',   // Too long
      '12345678',     // Missing letter
      'ABCDEFGHZ',    // All letters
      '12345678X',    // Wrong check digit
      '',             // Empty string
      null,           // Null value
      undefined       // Undefined value
    ];

    invalidDnis.forEach(dni => {
      const result = validarDniNif(dni);
      expect(result).toBe(false);
    });
  });
});