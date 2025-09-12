import React, { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext(undefined);

// Mock data for demo
const initialQuestions = [
  // Programming Questions (20)
  {
    id: '1',
    text: 'Which of the following is NOT a programming paradigm?',
    options: ['Object-Oriented', 'Functional', 'Procedural', 'Sequential'],
    correctAnswer: 3,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '2',
    text: 'What does "OOP" stand for in programming?',
    options: ['Object-Oriented Programming', 'Open-Open Protocol', 'Organized Operation Process', 'Optional Output Parameter'],
    correctAnswer: 0,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '3',
    text: 'Which data structure follows LIFO principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '4',
    text: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '5',
    text: 'Which sorting algorithm has the best average-case time complexity?',
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '6',
    text: 'What is polymorphism in OOP?',
    options: ['Having multiple constructors', 'Ability to take multiple forms', 'Creating multiple objects', 'Using multiple inheritance'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '7',
    text: 'Which keyword is used to inherit a class in Java?',
    options: ['implements', 'extends', 'inherits', 'derives'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '8',
    text: 'What is the output of "Hello World".length() in Java?',
    options: ['10', '11', '12', 'Error'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '9',
    text: 'Which design pattern ensures only one instance of a class exists?',
    options: ['Factory', 'Singleton', 'Observer', 'Strategy'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '10',
    text: 'What does API stand for?',
    options: ['Application Programming Interface', 'Advanced Programming Implementation', 'Automated Process Integration', 'Application Process Interface'],
    correctAnswer: 0,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '11',
    text: 'Which data structure is best for implementing recursion?',
    options: ['Array', 'Queue', 'Stack', 'Hash Table'],
    correctAnswer: 2,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '12',
    text: 'What is the space complexity of merge sort?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 2,
    category: 'Programming',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '13',
    text: 'Which programming language is known for its use in data science?',
    options: ['C++', 'Java', 'Python', 'Assembly'],
    correctAnswer: 2,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '14',
    text: 'What is encapsulation in OOP?',
    options: ['Hiding implementation details', 'Creating multiple objects', 'Inheriting properties', 'Overloading methods'],
    correctAnswer: 0,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '15',
    text: 'Which of these is NOT a valid variable name in most programming languages?',
    options: ['_variable', 'variable1', '1variable', 'variableOne'],
    correctAnswer: 2,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '16',
    text: 'What is the worst-case time complexity of quicksort?',
    options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '17',
    text: 'Which principle states that software entities should be open for extension but closed for modification?',
    options: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '18',
    text: 'What does DRY principle stand for?',
    options: ['Do Repeat Yourself', "Don't Repeat Yourself", 'Do Review Yearly', 'Debug Regularly Yearly'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '19',
    text: 'Which data structure is used to implement BFS (Breadth-First Search)?',
    options: ['Stack', 'Queue', 'Priority Queue', 'Heap'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '20',
    text: 'What is the primary purpose of version control systems?',
    options: ['Code compilation', 'Track changes in code', 'Code execution', 'Code documentation'],
    correctAnswer: 1,
    category: 'Programming',
    difficulty: 'Easy',
    points: 5
  },

  // DBMS Questions (20)
  {
    id: '21',
    text: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'],
    correctAnswer: 0,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '22',
    text: 'Which of the following is NOT a type of database relationship?',
    options: ['One-to-One', 'One-to-Many', 'Many-to-Many', 'All-to-All'],
    correctAnswer: 3,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '23',
    text: 'What is a primary key in a database?',
    options: ['A key that opens the database', 'A unique identifier for records', 'The first column in a table', 'A password for the database'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '24',
    text: 'Which SQL command is used to retrieve data from a database?',
    options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
    correctAnswer: 2,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '25',
    text: 'What does ACID stand for in database transactions?',
    options: ['Atomicity, Consistency, Isolation, Durability', 'Accuracy, Completeness, Integrity, Data', 'Authorization, Control, Implementation, Design', 'Access, Create, Insert, Delete'],
    correctAnswer: 0,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '26',
    text: 'Which normal form eliminates transitive dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correctAnswer: 2,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '27',
    text: 'What is a foreign key?',
    options: ['A key from another country', 'A reference to primary key of another table', 'An encrypted key', 'A backup key'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '28',
    text: 'Which SQL clause is used to filter records?',
    options: ['FILTER', 'WHERE', 'HAVING', 'CONDITION'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '29',
    text: 'What is the purpose of indexing in databases?',
    options: ['To organize data alphabetically', 'To improve query performance', 'To backup data', 'To encrypt data'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '30',
    text: 'Which join returns all records from both tables?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
    correctAnswer: 3,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '31',
    text: 'What is denormalization in databases?',
    options: ['Making data abnormal', 'Reducing normal forms for performance', 'Removing all data', 'Adding more tables'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '32',
    text: 'Which command is used to modify existing records in SQL?',
    options: ['MODIFY', 'CHANGE', 'UPDATE', 'ALTER'],
    correctAnswer: 2,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '33',
    text: 'What is a view in SQL?',
    options: ['A way to see the database', 'A virtual table based on query results', 'A user interface', 'A backup copy'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '34',
    text: 'Which storage engine is default in MySQL?',
    options: ['MyISAM', 'InnoDB', 'Memory', 'Archive'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '35',
    text: 'What is the purpose of GROUP BY clause?',
    options: ['To group users', 'To group records with same values', 'To create groups in database', 'To group tables'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '36',
    text: 'Which constraint ensures that a column cannot have NULL values?',
    options: ['UNIQUE', 'CHECK', 'NOT NULL', 'PRIMARY KEY'],
    correctAnswer: 2,
    category: 'DBMS',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '37',
    text: 'What is a trigger in databases?',
    options: ['A button to start database', 'Code that runs automatically on certain events', 'A type of query', 'A database user'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '38',
    text: 'Which isolation level prevents dirty reads?',
    options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '39',
    text: 'What is sharding in databases?',
    options: ['Breaking database into pieces', 'Horizontal partitioning across multiple servers', 'Encrypting data', 'Backing up data'],
    correctAnswer: 1,
    category: 'DBMS',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '40',
    text: 'Which command is used to remove a table structure?',
    options: ['DELETE', 'REMOVE', 'DROP', 'CLEAR'],
    correctAnswer: 2,
    category: 'DBMS',
    difficulty: 'Medium',
    points: 10
  },

  // Networks Questions (20)
  {
    id: '41',
    text: 'Which layer of the OSI model handles routing?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '42',
    text: 'What does TCP stand for?',
    options: ['Transmission Control Protocol', 'Transfer Control Protocol', 'Transport Communication Protocol', 'Technical Control Process'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '43',
    text: 'Which protocol is connectionless?',
    options: ['TCP', 'UDP', 'HTTP', 'FTP'],
    correctAnswer: 1,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '44',
    text: 'What is the default port number for HTTP?',
    options: ['21', '22', '80', '443'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '45',
    text: 'Which device operates at the Physical layer of OSI model?',
    options: ['Router', 'Switch', 'Hub', 'Bridge'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '46',
    text: 'What does DNS stand for?',
    options: ['Domain Name System', 'Data Network Service', 'Digital Name Server', 'Domain Network Security'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '47',
    text: 'Which IP address class has the range 192.0.0.0 to 223.255.255.255?',
    options: ['Class A', 'Class B', 'Class C', 'Class D'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '48',
    text: 'What is the purpose of ARP protocol?',
    options: ['Address Resolution Protocol - maps IP to MAC', 'Application Request Protocol', 'Automatic Routing Protocol', 'Advanced Registration Protocol'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '49',
    text: 'Which topology connects all devices to a central hub?',
    options: ['Bus', 'Ring', 'Star', 'Mesh'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '50',
    text: 'What is the maximum number of hosts in a /24 subnet?',
    options: ['254', '255', '256', '512'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '51',
    text: 'Which protocol is used for secure web browsing?',
    options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
    correctAnswer: 1,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '52',
    text: 'What does DHCP stand for?',
    options: ['Dynamic Host Configuration Protocol', 'Data Host Control Protocol', 'Digital Hardware Communication Protocol', 'Dynamic Hardware Control Process'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '53',
    text: 'Which layer is responsible for error detection and correction?',
    options: ['Physical', 'Data Link', 'Network', 'Transport'],
    correctAnswer: 1,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '54',
    text: 'What is the purpose of a firewall?',
    options: ['Speed up network', 'Control network traffic', 'Store data', 'Provide power'],
    correctAnswer: 1,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '55',
    text: 'Which routing protocol is used within an autonomous system?',
    options: ['BGP', 'OSPF', 'EIGRP', 'Both B and C'],
    correctAnswer: 3,
    category: 'Networks',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '56',
    text: 'What is the difference between a switch and a router?',
    options: ['No difference', 'Switch works at Layer 2, Router at Layer 3', 'Router is faster', 'Switch is more expensive'],
    correctAnswer: 1,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '57',
    text: 'Which protocol is used for email transmission?',
    options: ['HTTP', 'FTP', 'SMTP', 'DNS'],
    correctAnswer: 2,
    category: 'Networks',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '58',
    text: 'What is VLAN?',
    options: ['Virtual Local Area Network', 'Very Large Area Network', 'Variable Length Address Network', 'Verified Local Access Network'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '59',
    text: 'Which congestion control algorithm is used by TCP?',
    options: ['Slow Start', 'Fast Recovery', 'Congestion Avoidance', 'All of the above'],
    correctAnswer: 3,
    category: 'Networks',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '60',
    text: 'What is the purpose of NAT?',
    options: ['Network Address Translation', 'Network Access Terminal', 'Network Administration Tool', 'Network Authentication Technology'],
    correctAnswer: 0,
    category: 'Networks',
    difficulty: 'Medium',
    points: 10
  },

  // AI Questions (20)
  {
    id: '61',
    text: 'What is the primary goal of machine learning?',
    options: ['Data storage', 'Pattern recognition', 'Network communication', 'User interface design'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '62',
    text: 'Which of the following is a supervised learning algorithm?',
    options: ['K-Means', 'Linear Regression', 'DBSCAN', 'Apriori'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '63',
    text: 'What does CNN stand for in deep learning?',
    options: ['Computer Neural Network', 'Convolutional Neural Network', 'Complex Neural Network', 'Cognitive Neural Network'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '64',
    text: 'Which activation function is most commonly used in hidden layers?',
    options: ['Sigmoid', 'Tanh', 'ReLU', 'Linear'],
    correctAnswer: 2,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '65',
    text: 'What is overfitting in machine learning?',
    options: ['Model performs well on training but poor on test data', 'Model performs poorly on all data', 'Model is too simple', 'Model has too few parameters'],
    correctAnswer: 0,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '66',
    text: 'Which algorithm is used for clustering?',
    options: ['Linear Regression', 'Decision Tree', 'K-Means', 'Naive Bayes'],
    correctAnswer: 2,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '67',
    text: 'What is the purpose of cross-validation?',
    options: ['To increase training speed', 'To evaluate model performance', 'To reduce memory usage', 'To visualize data'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '68',
    text: 'Which of these is NOT a type of machine learning?',
    options: ['Supervised', 'Unsupervised', 'Reinforcement', 'Deterministic'],
    correctAnswer: 3,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '69',
    text: 'What does NLP stand for?',
    options: ['Natural Language Processing', 'Neural Language Programming', 'Network Layer Protocol', 'New Learning Process'],
    correctAnswer: 0,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '70',
    text: 'Which loss function is commonly used for binary classification?',
    options: ['Mean Squared Error', 'Binary Cross-Entropy', 'Categorical Cross-Entropy', 'Hinge Loss'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '71',
    text: 'What is gradient descent?',
    options: ['A data preprocessing technique', 'An optimization algorithm', 'A neural network architecture', 'A clustering method'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '72',
    text: 'Which technique is used to prevent overfitting?',
    options: ['Dropout', 'Regularization', 'Early Stopping', 'All of the above'],
    correctAnswer: 3,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '73',
    text: 'What is a perceptron?',
    options: ['A clustering algorithm', 'A single-layer neural network', 'A data visualization tool', 'A preprocessing technique'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '74',
    text: 'Which metric is NOT suitable for imbalanced datasets?',
    options: ['Precision', 'Recall', 'F1-Score', 'Accuracy'],
    correctAnswer: 3,
    category: 'AI',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '75',
    text: 'What is the vanishing gradient problem?',
    options: ['Gradients become too large', 'Gradients become very small in deep networks', 'Gradients disappear completely', 'Gradients become negative'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '76',
    text: 'Which algorithm is best for recommendation systems?',
    options: ['Linear Regression', 'Collaborative Filtering', 'K-Means', 'Decision Tree'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '77',
    text: 'What is transfer learning?',
    options: ['Moving data between systems', 'Using pre-trained models for new tasks', 'Transferring knowledge between humans', 'Converting file formats'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '78',
    text: 'Which type of neural network is best for sequence data?',
    options: ['CNN', 'RNN', 'Autoencoder', 'GAN'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '79',
    text: 'What is the purpose of attention mechanism in neural networks?',
    options: ['To reduce computational cost', 'To focus on relevant parts of input', 'To prevent overfitting', 'To increase training speed'],
    correctAnswer: 1,
    category: 'AI',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '80',
    text: 'Which framework is most popular for deep learning?',
    options: ['TensorFlow', 'PyTorch', 'Keras', 'All are popular'],
    correctAnswer: 3,
    category: 'AI',
    difficulty: 'Easy',
    points: 5
  },

  // Cybersecurity Questions (20)
  {
    id: '81',
    text: 'Which encryption algorithm is considered quantum-resistant?',
    options: ['RSA', 'AES', 'Lattice-based cryptography', 'DES'],
    correctAnswer: 2,
    category: 'Cybersecurity',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '82',
    text: 'What does CIA triad stand for in cybersecurity?',
    options: ['Confidentiality, Integrity, Availability', 'Computer, Internet, Access', 'Cyber, Information, Authentication', 'Central, Intelligence, Agency'],
    correctAnswer: 0,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '83',
    text: 'Which attack involves flooding a network with traffic?',
    options: ['Phishing', 'DDoS', 'SQL Injection', 'Cross-site Scripting'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '84',
    text: 'What is the purpose of a VPN?',
    options: ['Speed up internet', 'Create secure tunnel over public network', 'Block advertisements', 'Compress data'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '85',
    text: 'Which cryptographic hash function is considered secure?',
    options: ['MD5', 'SHA-1', 'SHA-256', 'CRC32'],
    correctAnswer: 2,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '86',
    text: 'What is social engineering in cybersecurity?',
    options: ['Building social networks', 'Manipulating people to reveal information', 'Engineering social media platforms', 'Creating user interfaces'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '87',
    text: 'Which protocol provides secure communication over HTTP?',
    options: ['FTP', 'HTTPS', 'SMTP', 'DNS'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '88',
    text: 'What is a zero-day vulnerability?',
    options: ['A vulnerability that takes zero days to exploit', 'A vulnerability unknown to security vendors', 'A vulnerability that causes zero damage', 'A vulnerability in zero-cost software'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '89',
    text: 'Which authentication factor is "something you know"?',
    options: ['Fingerprint', 'Password', 'Smart card', 'Voice recognition'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '90',
    text: 'What is the purpose of penetration testing?',
    options: ['To break into systems illegally', 'To test network speed', 'To identify security vulnerabilities', 'To install software'],
    correctAnswer: 2,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '91',
    text: 'Which malware type replicates itself across networks?',
    options: ['Virus', 'Worm', 'Trojan', 'Spyware'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '92',
    text: 'What is the principle of least privilege?',
    options: ['Give maximum access to all users', 'Give minimum access necessary for job function', 'Give access based on seniority', 'Give no access to anyone'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '93',
    text: 'Which encryption type uses the same key for encryption and decryption?',
    options: ['Asymmetric', 'Symmetric', 'Hash', 'Digital signature'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '94',
    text: 'What is a honeypot in cybersecurity?',
    options: ['A sweet reward for hackers', 'A decoy system to detect attacks', 'A secure vault for passwords', 'A type of encryption'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '95',
    text: 'Which attack targets web application databases?',
    options: ['Phishing', 'DDoS', 'SQL Injection', 'Man-in-the-middle'],
    correctAnswer: 2,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '96',
    text: 'What is two-factor authentication (2FA)?',
    options: ['Using two passwords', 'Using two different authentication methods', 'Authentication taking two steps', 'Authentication for two users'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '97',
    text: 'Which tool is commonly used for network security monitoring?',
    options: ['Wireshark', 'Microsoft Word', 'Photoshop', 'Calculator'],
    correctAnswer: 0,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  },
  {
    id: '98',
    text: 'What is ransomware?',
    options: ['Software that demands payment for decryption', 'Software that provides random numbers', 'Software that ransoms computers', 'Software that creates backups'],
    correctAnswer: 0,
    category: 'Cybersecurity',
    difficulty: 'Easy',
    points: 5
  },
  {
    id: '99',
    text: 'Which security framework is widely used for risk management?',
    options: ['NIST', 'ISO 27001', 'COBIT', 'All of the above'],
    correctAnswer: 3,
    category: 'Cybersecurity',
    difficulty: 'Hard',
    points: 15
  },
  {
    id: '100',
    text: 'What is the purpose of digital certificates?',
    options: ['To speed up websites', 'To verify identity and enable secure communication', 'To store personal data', 'To create backups'],
    correctAnswer: 1,
    category: 'Cybersecurity',
    difficulty: 'Medium',
    points: 10
  }
];

const initialQuizzes = [
  {
    id: '1',
    title: 'Programming Fundamentals',
    category: 'Programming',
    duration: 30,
    totalQuestions: 10,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    questions: ['1', '6', '7', '8', '9', '10', '11', '12', '13', '14'] // First 10 programming questions
  },
  {
    id: '2',
    title: 'Database Management Systems',
    category: 'DBMS',
    duration: 45,
    totalQuestions: 15,
    isActive: true,
    createdBy: '1',
    createdAt: new Date('2024-01-02'),
    questions: ['21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] // First 15 DBMS questions
  }
];

export function QuizProvider({ children }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedQuestions = localStorage.getItem('csit-quiz-questions');
    const savedQuizzes = localStorage.getItem('csit-quiz-quizzes');
    const savedAttempts = localStorage.getItem('csit-quiz-attempts');

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
    if (savedQuizzes) {
      // Parse and convert createdAt to Date
      const quizzes = JSON.parse(savedQuizzes).map((quiz) => ({
        ...quiz,
        createdAt: quiz.createdAt ? new Date(quiz.createdAt) : new Date()
      }));
      setQuizzes(quizzes);
    }
    if (savedAttempts) {
      // Parse and convert completedAt to Date
      const attempts = JSON.parse(savedAttempts).map((attempt) => ({
        ...attempt,
        completedAt: attempt.completedAt ? new Date(attempt.completedAt) : new Date()
      }));
      setAttempts(attempts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('csit-quiz-questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('csit-quiz-attempts', JSON.stringify(attempts));
  }, [attempts]);

  const addQuestion = (question) => {
    const newQuestion = { ...question, id: Date.now().toString() };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id, question) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...question } : q));
  };

  const deleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addQuiz = (quiz) => {
    const newQuiz = { ...quiz, id: Date.now().toString(), createdAt: new Date() };
    setQuizzes(prev => [...prev, newQuiz]);
  };

  const updateQuiz = (id, quiz) => {
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, ...quiz } : q));
  };

  const deleteQuiz = (id) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const submitQuizAttempt = (attempt) => {
    const newAttempt = { 
      ...attempt, 
      id: Date.now().toString(), 
      completedAt: new Date() 
    };
    setAttempts(prev => [...prev, newAttempt]);
  };

  const getStudentAttempts = (studentId) => {
    return attempts.filter(attempt => attempt.studentId === studentId);
  };

  const getQuizStatistics = (quizId) => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quizId);
    if (quizAttempts.length === 0) return null;

    const totalAttempts = quizAttempts.length;
    const averageScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
    const highestScore = Math.max(...quizAttempts.map(attempt => attempt.score));
    const lowestScore = Math.min(...quizAttempts.map(attempt => attempt.score));

    return {
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore
    };
  };

  const getQuestionsByTopics = (topics) => {
    if (!topics || topics.length === 0) return questions;
    return questions.filter(question => topics.includes(question.category));
  };

  const generateRandomQuestionSelection = (topics, count) => {
    const availableQuestions = getQuestionsByTopics(topics);
    
    if (availableQuestions.length === 0) {
      return [];
    }
    
    if (count >= availableQuestions.length) {
      return availableQuestions.map(q => q.id);
    }
    
    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(q => q.id);
  };

  const getAvailableTopics = () => {
    const topicsSet = new Set(questions.map(q => q.category));
    return Array.from(topicsSet);
  };

  return (
    <QuizContext.Provider value={{
      questions,
      quizzes,
      attempts,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addQuiz,
      updateQuiz,
      deleteQuiz,
      submitQuizAttempt,
      getStudentAttempts,
      getQuizStatistics,
      getQuestionsByTopics,
      generateRandomQuestionSelection,
      getAvailableTopics
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}