import unittest
import json
from unittest.mock import patch
from app import app

class TestRoutes(unittest.TestCase):

    def setUp(self):
        """Set up a test client for the Flask application."""
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'test-secret-key'
        self.client = app.test_client()

    def test_get_user_profile_me(self):
        """Test the /api/me route for a logged-in user."""
        with self.client as c:
            with c.session_transaction() as sess:
                sess['user_id'] = 'test-user-id'
                sess['vorname'] = 'Max'
                sess['nachname'] = 'Mustermann'
                sess['email'] = 'max@example.com'
                sess['geburtsdatum'] = '1990-05-15'

            response = c.get('/api/me')
            self.assertEqual(response.status_code, 200)
            data = json.loads(response.data)
            self.assertEqual(data['vorname'], 'Max')
            self.assertEqual(data['email'], 'max@example.com')

    def test_get_user_profile_me_unauthorized(self):
        """Test the /api/me route when no user is logged in."""
        response = self.client.get('/api/me')
        self.assertEqual(response.status_code, 401)

    @patch('routes.prognosen_routes.get_financial_profile')
    def test_get_prognosen_with_dummy_data(self, mock_get_profile):
        """Test /api/prognosen when the database returns no profile, using dummy data."""
        mock_get_profile.return_value = None
        response = self.client.get('/api/prognosen')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('kpis', data)
        self.assertEqual(len(data['kpis']), 4)
        self.assertIn('monthlyData', data)
        self.assertIn('wealthData', data)

    @patch('routes.financial_profile_routes.get_financial_profile')
    def test_get_financial_profile_found(self, mock_get_profile):
        """Test /api/financial-profile when a profile is found."""
        mock_profile = {"einnahmen_und_ausgaben": {"monatliches_netto_gehalt": 3000}}
        mock_get_profile.return_value = mock_profile

        response = self.client.get('/api/financial-profile')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data, mock_profile)

    @patch('routes.financial_profile_routes.get_financial_profile')
    def test_get_financial_profile_not_found(self, mock_get_profile):
        """Test /api/financial-profile when no profile is found."""
        mock_get_profile.return_value = None
        response = self.client.get('/api/financial-profile')
        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Finanzprofil nicht gefunden.')


if __name__ == '__main__':
    unittest.main()
