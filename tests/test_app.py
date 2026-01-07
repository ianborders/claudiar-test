"""Tests for Flask web application."""

import pytest
import sys
import os

# Add src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from app import app


@pytest.fixture
def client():
    """Create test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestIndex:
    def test_index_returns_html(self, client):
        response = client.get('/')
        assert response.status_code == 200
        assert b'Claudear Testing' in response.data

    def test_index_contains_buttons(self, client):
        response = client.get('/')
        assert b'data-op="add"' in response.data
        assert b'data-op="subtract"' in response.data
        assert b'data-op="multiply"' in response.data
        assert b'data-op="divide"' in response.data
        assert b'data-op="power"' in response.data

    def test_index_contains_theme_switcher(self, client):
        response = client.get('/')
        assert b'theme-switcher' in response.data
        assert b'theme-icon' in response.data
        assert b'theme-label' in response.data

    def test_index_has_data_theme_attribute(self, client):
        response = client.get('/')
        assert b'data-theme="arcade"' in response.data

    def test_index_loads_cyberpunk_css(self, client):
        response = client.get('/')
        assert b'cyberpunk.css' in response.data

    def test_index_loads_matrix_css(self, client):
        response = client.get('/')
        assert b'matrix.css' in response.data

    def test_index_loads_minimalist_css(self, client):
        response = client.get('/')
        assert b'minimalist.css' in response.data

    def test_index_loads_orbitron_font(self, client):
        response = client.get('/')
        assert b'Orbitron' in response.data

    def test_index_has_calc_title_id(self, client):
        response = client.get('/')
        assert b'id="calc-title"' in response.data

    def test_index_contains_footer(self, client):
        response = client.get('/')
        assert b'made-with-love' in response.data
        assert 'made with'.encode() in response.data
        assert b'Ian Borders' in response.data


class TestCalculateEndpoint:
    def test_add_operation(self, client):
        response = client.post('/calculate', json={
            'a': 5,
            'b': 3,
            'operation': 'add'
        })
        assert response.status_code == 200
        assert response.json['result'] == 8

    def test_subtract_operation(self, client):
        response = client.post('/calculate', json={
            'a': 10,
            'b': 4,
            'operation': 'subtract'
        })
        assert response.status_code == 200
        assert response.json['result'] == 6

    def test_multiply_operation(self, client):
        response = client.post('/calculate', json={
            'a': 7,
            'b': 6,
            'operation': 'multiply'
        })
        assert response.status_code == 200
        assert response.json['result'] == 42

    def test_divide_operation(self, client):
        response = client.post('/calculate', json={
            'a': 20,
            'b': 4,
            'operation': 'divide'
        })
        assert response.status_code == 200
        assert response.json['result'] == 5

    def test_power_operation(self, client):
        response = client.post('/calculate', json={
            'a': 2,
            'b': 8,
            'operation': 'power'
        })
        assert response.status_code == 200
        assert response.json['result'] == 256

    def test_divide_by_zero_returns_error(self, client):
        response = client.post('/calculate', json={
            'a': 10,
            'b': 0,
            'operation': 'divide'
        })
        assert response.status_code == 400
        assert 'error' in response.json
        assert 'zero' in response.json['error'].lower()

    def test_invalid_operation_returns_error(self, client):
        response = client.post('/calculate', json={
            'a': 5,
            'b': 3,
            'operation': 'invalid'
        })
        assert response.status_code == 400
        assert 'error' in response.json

    def test_float_inputs(self, client):
        response = client.post('/calculate', json={
            'a': 3.5,
            'b': 2.5,
            'operation': 'add'
        })
        assert response.status_code == 200
        assert response.json['result'] == 6.0

    def test_negative_numbers(self, client):
        response = client.post('/calculate', json={
            'a': -5,
            'b': 3,
            'operation': 'add'
        })
        assert response.status_code == 200
        assert response.json['result'] == -2

    def test_string_number_conversion(self, client):
        response = client.post('/calculate', json={
            'a': '10',
            'b': '5',
            'operation': 'add'
        })
        assert response.status_code == 200
        assert response.json['result'] == 15
