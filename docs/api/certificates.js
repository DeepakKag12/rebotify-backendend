/**
 * @swagger
 * /api/certificates:
 *   post:
 *     tags: [Certificates]
 *     summary: Upload certificate
 *     description: Upload a new certificate document for verification
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - certificateNumber
 *               - issuingAuthority
 *               - validityPeriod
 *               - uploadDocument
 *             properties:
 *               documentType:
 *                 type: string
 *                 description: Type of certificate
 *                 example: "Recycler License"
 *               certificateNumber:
 *                 type: string
 *                 pattern: "^CERT-\\d{4}-\\d{5}$"
 *                 description: Certificate number
 *                 example: "CERT-2023-12345"
 *               issuingAuthority:
 *                 type: string
 *                 description: Issuing authority
 *                 example: "Environmental Protection Agency"
 *               validityPeriod:
 *                 type: string
 *                 description: Validity period as JSON string
 *                 example: '{"start":"2023-01-01","end":"2024-01-01"}'
 *               uploadDocument:
 *                 type: string
 *                 format: binary
 *                 description: Certificate document file
 *     responses:
 *       201:
 *         description: Certificate uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Certificate uploaded successfully"
 *                 certificate:
 *                   $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Invalid input or file
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/certificates:
 *   get:
 *     tags: [Certificates]
 *     summary: Get user's certificates
 *     description: Retrieve all certificates for the authenticated user
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Certificates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certificates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/certificates/all:
 *   get:
 *     tags: [Certificates]
 *     summary: Get all certificates (Admin only)
 *     description: Retrieve all certificates in the system
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: All certificates retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 certificates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/certificates/{id}/approve:
 *   patch:
 *     tags: [Certificates]
 *     summary: Approve/Disapprove certificate (Admin only)
 *     description: Update certificate approval status
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Certificate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateStatusUpdate'
 *     responses:
 *       200:
 *         description: Certificate status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Certificate approved successfully"
 *                 certificate:
 *                   $ref: '#/components/schemas/Certificate'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Certificate not found
 */

/**
 * @swagger
 * /api/certificates/{id}:
 *   put:
 *     tags: [Certificates]
 *     summary: Update certificate details
 *     description: Update certificate information (owner only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Certificate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateDetailsUpdate'
 *     responses:
 *       200:
 *         description: Certificate updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not certificate owner
 *       404:
 *         description: Certificate not found
 */

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     tags: [Certificates]
 *     summary: Delete certificate
 *     description: Delete a certificate (owner only)
 *     security:
 *       - BearerAuth: []
 *       - CookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Certificate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not certificate owner
 *       404:
 *         description: Certificate not found
 */
