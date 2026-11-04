export const failureCases = [
  {
    "dataset": "replica",
    "scene": "apartment_1",
    "episodeId": 57,
    "topView": "assets/images/replica-apartment_1-propane-57-top-view.svg?v=837b7aaa79b9",
    "rotationDegrees": 90,
    "videos": [
      {
        "agent": "ours",
        "label": "OdorSpaces (Ours)",
        "spl": 0.0,
        "duration": 10.8,
        "width": 888,
        "height": 1200,
        "src": "assets/videos/propane/replica/apartment_1/57/ours-portrait-eval.mp4",
        "poster": "assets/videos/propane/replica/apartment_1/57/ours-portrait-eval.jpg",
        "stopSuccess": false
      },
      {
        "agent": "drt",
        "label": "DRT-RL",
        "spl": 0.0,
        "duration": 10.8,
        "width": 888,
        "height": 1200,
        "src": "assets/videos/propane/replica/apartment_1/57/drt-portrait-eval.mp4",
        "poster": "assets/videos/propane/replica/apartment_1/57/drt-portrait-eval.jpg",
        "stopSuccess": false
      }
    ],
    "title": "Failure to complete an obstacle detour (propane gas leak)",
    "description": "Ours stalls at an obstacle before reaching the source and does not complete the longer route around it. DRT-RL also fails in this episode."
  },
  {
    "dataset": "replica",
    "scene": "frl_apartment_4",
    "episodeId": 71,
    "topView": "assets/images/replica-frl_apartment_4-methanol-71-top-view.svg?v=c82cb73c0e19",
    "rotationDegrees": 0,
    "videos": [
      {
        "agent": "ours",
        "label": "OdorSpaces (Ours)",
        "spl": 0.0,
        "duration": 16.2,
        "width": 738,
        "height": 1200,
        "src": "assets/videos/methanol/replica/frl_apartment_4/71/ours-portrait-eval.mp4",
        "poster": "assets/videos/methanol/replica/frl_apartment_4/71/ours-portrait-eval.jpg",
        "stopSuccess": false
      },
      {
        "agent": "drt",
        "label": "DRT-RL",
        "spl": 0.0,
        "duration": 0.8,
        "width": 738,
        "height": 1200,
        "src": "assets/videos/methanol/replica/frl_apartment_4/71/drt-portrait-eval.mp4",
        "poster": "assets/videos/methanol/replica/frl_apartment_4/71/drt-portrait-eval.jpg",
        "stopSuccess": false
      }
    ],
    "title": "Misleading peak (methanol pool fire)",
    "description": "Heat-driven buoyancy can create misleading local CO₂ concentration peaks away from the source. The agent can be misled by these peaks and fail to reach the source."
  }
];
