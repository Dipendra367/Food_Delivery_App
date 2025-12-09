const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/addresses - Get all addresses for the user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('addresses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.addresses || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/addresses - Add new address
router.post('/', auth, async (req, res) => {
    try {
        const { label, street, city, area, landmark, phone, isDefault, coordinates } = req.body;

        console.log('Adding address for user:', req.user.userId);
        console.log('Address data:', { label, street, city, area, landmark, phone, coordinates });

        const user = await User.findById(req.user.userId);
        if (!user) {
            console.error('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize addresses array if it doesn't exist
        if (!user.addresses) {
            user.addresses = [];
        }

        // If this is set as default, unset all other defaults
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        // If this is the first address, make it default
        const makeDefault = isDefault || user.addresses.length === 0;

        const newAddress = {
            label,
            street,
            city,
            area,
            landmark,
            phone,
            isDefault: makeDefault
        };

        // Add coordinates if provided
        if (coordinates && coordinates.lat && coordinates.lng) {
            newAddress.coordinates = {
                lat: coordinates.lat,
                lng: coordinates.lng
            };
        }

        user.addresses.push(newAddress);

        await user.save();

        console.log('Address saved successfully');
        res.status(201).json(user.addresses[user.addresses.length - 1]);
    } catch (err) {
        console.error('Error saving address:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// PUT /api/addresses/:id - Update address
router.put('/:id', auth, async (req, res) => {
    try {
        const { label, street, city, area, landmark, phone, isDefault, coordinates } = req.body;

        console.log('Updating address:', req.params.id);
        console.log('User ID:', req.user.userId);
        console.log('Request body:', req.body);

        const user = await User.findById(req.user.userId);
        if (!user) {
            console.error('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User addresses:', user.addresses.map(a => ({ id: a._id.toString(), label: a.label })));

        const address = user.addresses.id(req.params.id);
        if (!address) {
            console.error('Address not found:', req.params.id);
            console.error('Available addresses:', user.addresses.map(a => a._id.toString()));
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting as default, unset all other defaults
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        address.label = label || address.label;
        address.street = street || address.street;
        address.city = city || address.city;
        address.area = area || address.area;
        address.landmark = landmark !== undefined ? landmark : address.landmark;
        address.phone = phone || address.phone;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        // Update coordinates if provided (optional)
        if (coordinates && coordinates.lat && coordinates.lng) {
            address.coordinates = {
                lat: coordinates.lat,
                lng: coordinates.lng
            };
        }

        await user.save();

        console.log('Address updated successfully');
        res.json(address);
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If deleted address was default, make the first remaining address default
        const wasDefault = address.isDefault;

        user.addresses.pull(req.params.id);

        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/addresses/:id/default - Set address as default
router.put('/:id/default', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Unset all defaults
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        // Set this one as default
        address.isDefault = true;

        await user.save();

        res.json(address);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
