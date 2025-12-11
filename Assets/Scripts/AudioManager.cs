using UnityEngine;
using System.Collections.Generic;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;

    [System.Serializable]
    public class Sound
    {
        public string name;
        public AudioClip clip;
        [Range(0, 1)] public float volume = 1f;
        public bool loop;
    }

    [SerializeField] private Sound[] sounds;

    private Dictionary<string, AudioSource> soundMap;

    private void Awake()
    {
        if (Instance != null) { Destroy(gameObject); return; }
        Instance = this;
        //DontDestroyOnLoad(gameObject);

        soundMap = new Dictionary<string, AudioSource>();

        foreach (var s in sounds)
        {
            AudioSource source = gameObject.AddComponent<AudioSource>();
            source.clip = s.clip;
            source.volume = s.volume;
            source.loop = s.loop;
            if (s.name == "boomerang")
            {
                source.pitch = 2.2f;
            }
            soundMap.Add(s.name, source);
        }
    }

    public void Play(string name)
    {
        if (soundMap.TryGetValue(name, out var src))
            src.PlayOneShot(src.clip, src.volume);
    }


    public void Stop(string name)
    {
        if (soundMap.TryGetValue(name, out var src))
            src.Stop();
    }

    public void SetVolume(string name, float vol)
    {
        if (soundMap.TryGetValue(name, out var src))
            src.volume = vol;
    }
}
