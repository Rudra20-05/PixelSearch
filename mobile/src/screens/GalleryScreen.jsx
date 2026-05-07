/**
 * PixelSearch Mobile — Gallery / Index Screen
 * Scans the phone's photo library, encodes each image using ONNX CLIP,
 * and stores embeddings in local SQLite. 100% offline.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  Image, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveEmbedding, getIndexedCount, clearIndex, isIndexed } from '../utils/database';
import { encodeImage, loadModel } from '../utils/onnxSearch';

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexedCount, setIndexedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermission(status === 'granted');
      if (status === 'granted') {
        await loadPhotos();
        setIndexedCount(await getIndexedCount());
      }
    })();
  }, []);

  const loadPhotos = async () => {
    const { assets, totalCount } = await MediaLibrary.getAssetsAsync({
      mediaType: 'photo',
      first: 500,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });
    setPhotos(assets);
    setTotalCount(totalCount);
  };

  const handleIndexAll = useCallback(async () => {
    const unindexed = [];
    for (const photo of photos) {
      if (!(await isIndexed(photo.uri))) unindexed.push(photo);
    }

    if (unindexed.length === 0) {
      Alert.alert('All done!', 'All photos are already indexed.');
      return;
    }

    Alert.alert(
      'Index Photos',
      `Index ${unindexed.length} new photos? This runs entirely on your device — no data leaves your phone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: `Index ${unindexed.length} photos`, onPress: () => runIndexing(unindexed) },
      ]
    );
  }, [photos]);

  const runIndexing = async (photosToIndex) => {
    setIsIndexing(true);
    setProgress({ current: 0, total: photosToIndex.length });
    setStatusMsg('Loading AI model...');

    try {
      await loadModel(); // warm up ONNX session
      setStatusMsg('Encoding photos...');

      for (let i = 0; i < photosToIndex.length; i++) {
        const photo = photosToIndex[i];
        setProgress({ current: i + 1, total: photosToIndex.length });
        setStatusMsg(`Encoding ${i + 1} / ${photosToIndex.length}`);

        try {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(photo.id);
          const embedding = await encodeImage(assetInfo.localUri || assetInfo.uri);
          await saveEmbedding(photo.uri, photo.filename, embedding, []);
        } catch (err) {
          console.warn(`Skip ${photo.filename}:`, err.message);
        }
      }

      const newCount = await getIndexedCount();
      setIndexedCount(newCount);
      setStatusMsg('');
      Alert.alert('Done!', `${photosToIndex.length} photos indexed and ready to search.`);
    } catch (err) {
      Alert.alert('Error', 'Indexing failed: ' + err.message);
    } finally {
      setIsIndexing(false);
    }
  };

  const handleClearIndex = () => {
    Alert.alert(
      'Clear Index',
      'Remove all indexed embeddings? Your photos are not deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: async () => {
            await clearIndex();
            setIndexedCount(0);
          }
        }
      ]
    );
  };

  if (permission === null) return null;
  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permTitle}>Photo Access Needed</Text>
        <Text style={styles.permSub}>
          PixelSearch needs access to your photo library to index and search your photos.
          All processing happens on-device.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => MediaLibrary.requestPermissionsAsync()}
        >
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pct = progress.total > 0 ? progress.current / progress.total : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Stats Header */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalCount}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{indexedCount}</Text>
          <Text style={styles.statLabel}>Indexed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalCount - indexedCount}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Index Progress */}
      {isIndexing && (
        <View style={styles.progressCard}>
          <Text style={styles.progressMsg}>{statusMsg}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <Text style={styles.progressPct}>{(pct * 100).toFixed(0)}%</Text>
        </View>
      )}

      {/* Actions */}
      {!isIndexing && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={handleIndexAll}>
            <Text style={styles.btnText}>⚡ Index New Photos</Text>
          </TouchableOpacity>
          {indexedCount > 0 && (
            <TouchableOpacity style={styles.btnDanger} onPress={handleClearIndex}>
              <Text style={styles.btnDangerText}>Clear Index</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Photo Grid Preview */}
      <FlatList
        data={photos}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.photoRow}
        contentContainerStyle={styles.photoGrid}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.uri }}
            style={styles.thumb}
            resizeMode="cover"
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  centered: { flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center', padding: 32 },
  permTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  permSub: { color: '#64748b', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 28 },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#131625',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2a4a',
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { color: '#3b82f6', fontSize: 24, fontWeight: '800' },
  statLabel: { color: '#475569', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#1e2a4a' },

  progressCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#131625',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2a4a',
    padding: 16,
    gap: 10,
  },
  progressMsg: { color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  progressBar: { height: 6, backgroundColor: '#1e2a4a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 3 },
  progressPct: { color: '#3b82f6', fontSize: 12, fontWeight: '700', textAlign: 'center' },

  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  btn: {
    flex: 1, backgroundColor: '#3b82f6',
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDanger: {
    backgroundColor: 'transparent', borderWidth: 1,
    borderColor: '#ef4444', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center',
  },
  btnDangerText: { color: '#ef4444', fontWeight: '600', fontSize: 14 },

  photoGrid: { paddingHorizontal: 4, paddingBottom: 24 },
  photoRow: { gap: 2, marginBottom: 2 },
  thumb: { flex: 1, aspectRatio: 1, backgroundColor: '#131625' },
});
