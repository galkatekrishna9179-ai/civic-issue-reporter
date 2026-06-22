 

  // Middleware to parse JSON request bodies
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use(express.static('public'));

  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

  // Test route
  app.get('/', (req, res) => {
    res.send('Civic Issue Reporter API is running');
  });

  // Create a new issue
app.post('/issues', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('SERVER RECEIVED BODY:', req.body);
console.log('SERVER RECEIVED FILE:', req.file);
    const issueData = {
      ...req.body,
      imageUrl: req.file ? req.file.path : null
    };

    const newIssue = new Issue(issueData);
    const savedIssue = await newIssue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

  // Get all issues
// Get all issues
app.get('/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an issue's status
app.patch('/issues/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(updatedIssue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an issue
app.delete('/issues/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
    if (!deletedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json({ message: 'Issue deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });