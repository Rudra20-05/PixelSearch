/**
 * PixelSearch Mobile — Home / Search Screen
 */

import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, StatusBar,
  KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllEmbeddings, getIndexedCount } from '../utils/database';
import { encodeText, searchEmbeddings } from '../utils/onnxSearch';

const BACKEND_URL = 'http://10.0.2.2:8000'; // Android emulator → localhost

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTime, setSearchTime] = useState(0);
  const [totalIndexed, setTotalIndexed] = useState(null);

  // Load index count on mount
  useState(() => {
    getIndexedCount().then(setTotalIndexed);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setIsSearching(true);
    setError(null);
    const t0 = Date.now();

    try {
      // 1. Encode the text query (calls laptop backend for text embedding)
      const queryEmbedding = await encodeText(query, BACKEND_URL);

      // 2. Load all stored image embeddings from SQLite (stays local)
      const allEmbeddings = await getAllEmbeddings();

      if (allEmbeddings.length === 0) {
        setError('No images indexed yet. Tap the Gallery tab to index your photos.');
        setResults([]);
        return;
      }

      // 3. Cosine similarity search — 100% on-device
      const hits = searchEmbeddings(queryEmbedding, allEmbeddings, 20);
      setResults(hits);
      setSearchTime(Date.now() - t0);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const renderResult = useCallback(({ item, index }) => {
    const scoreColor =
      item.score > 0.5 ? '#22d3ee' :
      item.score > 0.3 ? '#fbbf24' : '#94a3b8';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { image: item })}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.uri }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardContent}>
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              {(item.score * 100).toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.cardFilename} numberOfLines={1}>{item.filename}</Text>
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>PixelSearch</Text>
        <Text style={styles.brandSub}>AI Photo Discovery</Text>
        {totalIndexed !== null && (
          <Text style={styles.statsLine}>{totalIndexed} photos indexed • offline</Text>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Describe a photo..."
          placeholderTextColor="#4a5568"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.searchBtn, isSearching && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.searchBtnText}>→</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      {results.length > 0 && !isSearching && (
        <Text style={styles.resultsMeta}>
          {results.length} results in {searchTime}ms
        </Text>
      )}

      {/* Error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Results Grid */}
      <FlatList
        data={results}
        keyExtractor={item => item.uri}
        renderItem={renderResult}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isSearching && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {query ? `No matches for "${query}"` : 'Search your photo library with natural language'}
              </Text>
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  brandSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statsLine: {
    fontSize: 11,
    color: '#334155',
    marginTop: 6,
  },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#131625',
    borderWidth: 1,
    borderColor: '#1e2a4a',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnDisabled: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  resultsMeta: {
    color: '#475569',
    fontSize: 12,
    textAlign: 'right',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    lineHeight: 20,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#131625',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e2a4a',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1e2a4a',
  },
  cardContent: {
    padding: 10,
    gap: 6,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFilename: {
    color: '#94a3b8',
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: '#1e2a4a',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    color: '#64748b',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#475569',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
