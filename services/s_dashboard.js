const lib = require('../libs/index');
let service = {};

service.getStats = async (req, res, next) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const statsQueries = {
            totalProperties: `SELECT COUNT(*) as count FROM property WHERE created_by = ${userId} AND is_deleted = 0`,
            occupiedProperties: `SELECT COUNT(*) as count FROM property WHERE created_by = ${userId} AND is_deleted = 0 AND occupied = 1`,
            activeAgreements: `SELECT COUNT(*) as count FROM agreement WHERE created_by = ${userId} AND is_deleted = 0 AND status = 0`,
            totalTenants: `SELECT COUNT(*) as count FROM tenent WHERE created_by = ${userId} AND is_deleted = 0`
        };

        const [propertiesResult, occupiedResult, agreementsResult, tenantsResult] = await Promise.all([
            lib.queryExecute(statsQueries.totalProperties),
            lib.queryExecute(statsQueries.occupiedProperties),
            lib.queryExecute(statsQueries.activeAgreements),
            lib.queryExecute(statsQueries.totalTenants)
        ]);

        const stats = {
            totalProperties: propertiesResult[0].count,
            occupiedProperties: occupiedResult[0].count,
            activeAgreements: agreementsResult[0].count,
            totalTenants: tenantsResult[0].count
        };

        res.status(200).send(stats);
    } catch (error) {
        console.error('Error in getStats:', error);
        res.status(500).send({ message: error.message });
    }
};

module.exports = service;
